// ============================================
// Firebase 实时同步模块
// 负责：点亮数据、留言数据、在线人数、统计计数、排行榜
// ============================================

import { db, isConfigured } from './firebase-config.js';
import {
  collection, onSnapshot, addDoc, serverTimestamp, query, where,
  doc, setDoc, updateDoc, increment, getDoc, deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export class FirebaseSync {
  constructor(group) {
    this.group = group;
    this.enabled = isConfigured;
    this.userId = 'u_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
    this.unsubscribers = [];
    this.callbacks = { lights: [], messages: [], stats: [], online: [], leaderboard: [] };
  }

  async init() {
    if (!this.enabled) {
      // 未配置 Firebase 时回退到 localStorage
      this._emit('lights', this._getLocalLights());
      this._emit('messages', this._getLocalMessages());
      this._emit('stats', {
        totalVisits: 0,
        totalLights: this._getLocalLights().length,
        totalMessages: this._getLocalMessages().length
      });
      this._emit('online', 1);
      this._emit('leaderboard', this._buildLocalLeaderboard());
      return;
    }

    this._listenLights();
    this._listenMessages();
    this._listenStats();
    this._listenPresence();
    this._listenLeaderboard();
    this._startPresence();
    this._incrementStat('totalVisits');
  }

  on(type, cb) { this.callbacks[type].push(cb); }
  _emit(type, data) { this.callbacks[type].forEach(cb => cb(data)); }

  // ---------- localStorage 回退 ----------
  _getLocalLights() {
    try { return JSON.parse(localStorage.getItem('tushan_group_' + this.group) || '[]'); }
    catch (e) { return []; }
  }
  _saveLocalLights(list) { localStorage.setItem('tushan_group_' + this.group, JSON.stringify(list)); }
  _getLocalMessages() {
    try { return JSON.parse(localStorage.getItem('tushan_memo_' + this.group) || '[]'); }
    catch (e) { return []; }
  }
  _buildLocalLeaderboard() {
    const map = {};
    this._getLocalLights().forEach(d => { map[d.name] = map[d.name] || { name: d.name, lights: 0, messages: 0 }; map[d.name].lights++; });
    this._getLocalMessages().forEach(d => { map[d.name] = map[d.name] || { name: d.name, lights: 0, messages: 0 }; map[d.name].messages++; });
    return Object.values(map).sort((a, b) => (b.lights + b.messages) - (a.lights + a.messages));
  }

  // ---------- 点亮 ----------
  async syncLight(data) {
    if (!this.enabled) {
      const list = this._getLocalLights();
      list.push({ ...data, time: Date.now() });
      this._saveLocalLights(list);
      this._emit('lights', list);
      this._emit('stats', { totalVisits: 0, totalLights: list.length, totalMessages: this._getLocalMessages().length });
      this._emit('leaderboard', this._buildLocalLeaderboard());
      return;
    }
    await addDoc(collection(db, 'lights'), {
      name: data.name,
      group: this.group,
      ringIndex: data.ringIndex,
      pointIndex: data.pointIndex,
      color: data.color || '#fff0a0',
      time: serverTimestamp()
    });
    await this._incrementUserStat(data.name, 'lights');
    await this._incrementStat('totalLights');
  }

  // ---------- 留言 ----------
  async syncMessage(data) {
    if (!this.enabled) {
      const list = this._getLocalMessages();
      list.push({ ...data, time: Date.now() });
      localStorage.setItem('tushan_memo_' + this.group, JSON.stringify(list));
      this._emit('messages', list);
      this._emit('stats', { totalVisits: 0, totalLights: this._getLocalLights().length, totalMessages: list.length });
      this._emit('leaderboard', this._buildLocalLeaderboard());
      return;
    }
    await addDoc(collection(db, 'messages'), {
      name: data.name,
      text: data.text,
      group: this.group,
      time: serverTimestamp()
    });
    await this._incrementUserStat(data.name, 'messages');
    await this._incrementStat('totalMessages');
  }

  // ---------- 实时监听 ----------
  _listenLights() {
    const q = query(collection(db, 'lights'), where('group', '==', this.group));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        time: d.data().time?.toMillis?.() || Date.now()
      })).sort((a, b) => a.time - b.time);
      this._emit('lights', list);
    }, err => console.error('lights sync error', err));
    this.unsubscribers.push(unsub);
  }

  _listenMessages() {
    const q = query(collection(db, 'messages'), where('group', '==', this.group));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        time: d.data().time?.toMillis?.() || Date.now()
      })).sort((a, b) => a.time - b.time);
      this._emit('messages', list);
    }, err => console.error('messages sync error', err));
    this.unsubscribers.push(unsub);
  }

  _listenStats() {
    const unsub = onSnapshot(doc(db, 'stats', 'global'), snap => {
      this._emit('stats', snap.exists() ? snap.data() : { totalVisits: 0, totalLights: 0, totalMessages: 0 });
    }, err => console.error('stats sync error', err));
    this.unsubscribers.push(unsub);
  }

  _listenPresence() {
    const q = query(collection(db, 'presence'));
    const unsub = onSnapshot(q, snap => {
      this._emit('online', snap.size);
    }, err => console.error('presence sync error', err));
    this.unsubscribers.push(unsub);
  }

  _listenLeaderboard() {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => d.data()).sort((a, b) =>
        ((b.lights || 0) + (b.messages || 0)) - ((a.lights || 0) + (a.messages || 0))
      );
      this._emit('leaderboard', list);
    }, err => console.error('leaderboard sync error', err));
    this.unsubscribers.push(unsub);
  }

  // ---------- 在线心跳 ----------
  async _startPresence() {
    const ref = doc(db, 'presence', this.userId);
    await setDoc(ref, { lastSeen: serverTimestamp(), group: this.group });
    this._heartbeat = setInterval(() => {
      setDoc(ref, { lastSeen: serverTimestamp(), group: this.group }, { merge: true });
    }, 5000);
    window.addEventListener('beforeunload', () => {
      try { deleteDoc(ref); } catch (e) {}
    });
  }

  // ---------- 计数器 ----------
  async _incrementStat(field) {
    const ref = doc(db, 'stats', 'global');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { totalVisits: 0, totalLights: 0, totalMessages: 0, lastUpdated: serverTimestamp() });
    }
    await updateDoc(ref, { [field]: increment(1), lastUpdated: serverTimestamp() });
  }

  async _incrementUserStat(name, field) {
    const ref = doc(db, 'users', name);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { name, lights: 0, messages: 0, lastActive: serverTimestamp(), [field]: 1 });
    } else {
      await updateDoc(ref, { [field]: increment(1), lastActive: serverTimestamp() });
    }
  }

  dispose() {
    this.unsubscribers.forEach(u => u());
    if (this._heartbeat) clearInterval(this._heartbeat);
  }
}
