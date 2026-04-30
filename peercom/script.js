document.addEventListener('DOMContentLoaded', () => {

  const $ = id => document.getElementById(id);


  const setupModal = $('pc-setup-modal');
  const setupPseudoInput = $('pc-setup-pseudo');
  const setupConfirmBtn = $('pc-setup-confirm');


  const pseudoModal = $('pc-pseudo-modal');
  const pseudoInput = $('pc-pseudo-input');
  const pseudoSaveBtn = $('pc-pseudo-save');
  const pseudoCancelBtn = $('pc-pseudo-cancel');


  const myAvatarEl = $('pc-my-avatar');
  const myPseudoEl = $('pc-my-pseudo');
  const myPermanentIdEl = $('pc-my-permanent-id');
  const anonToggle = $('pc-anon-toggle');


  const landing = $('pc-landing');
  const statusDot = $('pc-status-dot');
  const statusText = $('pc-status-text');
  const myIdEl = $('pc-my-id');
  const copyIdBtn = $('pc-copy-id');
  const refreshIdBtn = $('pc-refresh-id');
  const peerInput = $('pc-peer-input');
  const connectBtn = $('pc-connect-btn');
  const featuresSection = $('pc-features');
  const howSection = $('pc-how');


  const contactsCountEl = $('pc-contacts-count');
  const contactsListEl = $('pc-contacts-list');
  const contactsEmptyEl = $('pc-contacts-empty');
  const pendingSection = $('pc-pending-section');
  const pendingListEl = $('pc-pending-list');


  const contactModal = $('pc-contact-modal');
  const contactRequestText = $('pc-contact-request-text');
  const contactAcceptBtn = $('pc-contact-accept');
  const contactRejectBtn = $('pc-contact-reject');


  const groupModal = $('pc-group-modal');
  const groupNameInput = $('pc-group-name-input');
  const groupCreateBtn = $('pc-group-create-btn');
  const groupCancelBtn = $('pc-group-cancel-btn');
  const openGroupModalBtn = $('pc-open-group-modal');
  const groupJoinInput = $('pc-group-join-input');
  const groupJoinBtn = $('pc-group-join-btn');


  const serverModal = $('pc-server-modal');
  const serverNameInput = $('pc-server-name-input');
  const serverCreateBtn = $('pc-server-create-btn');
  const serverCancelBtn = $('pc-server-cancel-btn');
  const openServerModalBtn = $('pc-open-server-modal');
  const serverJoinInput = $('pc-server-join-input');
  const serverJoinBtn = $('pc-server-join-btn');


  const chatSection = $('pc-chat-section');
  const chatPeerName = $('pc-chat-peer-name');
  const connStatus = $('pc-conn-status');
  const disconnectBtn = $('pc-disconnect-btn');
  const callBtn = $('pc-call-btn');
  const screenshareBtn = $('pc-screenshare-btn');
  const addContactBtn = $('pc-add-contact-btn');
  const membersBtn = $('pc-members-btn');
  const messagesEl = $('pc-messages');
  const messagesEmpty = $('pc-messages-empty');
  const typingEl = $('pc-typing');
  const chatForm = $('pc-chat-form');
  const msgInput = $('pc-msg-input');
  const sendBtn = $('pc-send-btn');
  const attachBtn = $('pc-attach-btn');
  const fileInput = $('pc-file-input');
  const toastContainer = $('toast-container');


  const membersDrawer = $('pc-members-drawer');
  const membersCountEl = $('pc-members-count');
  const membersListEl = $('pc-members-list');
  const membersCloseBtn = $('pc-members-close-btn');


  const callBanner = $('pc-call-banner');
  const callTimerEl = $('pc-call-timer');
  const muteBtn = $('pc-mute-btn');
  const callHangupBtn = $('pc-call-hangup-btn');
  const screenBanner = $('pc-screen-banner');
  const screenStopBtn = $('pc-screen-stop-btn');


  const screenOverlay = $('pc-screen-overlay');
  const screenVideo = $('pc-screen-video');
  const screenCloseBtn = $('pc-screen-close-btn');
  const remoteAudio = $('pc-remote-audio');


  const incomingModal = $('pc-incoming-modal');
  const incomingName = $('pc-incoming-name');
  const incomingType = $('pc-incoming-type');
  const incomingAcceptBtn = $('pc-incoming-accept');
  const incomingRejectBtn = $('pc-incoming-reject');


  const profilePopup = $('pc-profile-popup');
  const profileBanner = $('pc-profile-banner');
  const profileAvatar = $('pc-profile-avatar');
  const profileAvatarImg = $('pc-profile-avatar-img');
  const profileFrame = $('pc-profile-frame');
  const profileBadges = $('pc-profile-badges');
  const profileName = $('pc-profile-name');
  const profilePseudoId = $('pc-profile-pseudo-id');
  const profileBio = $('pc-profile-bio');
  const profileHsSection = $('pc-profile-hs-section');
  const profileHypesquad = $('pc-profile-hypesquad');
  const profileMemberSince = $('pc-profile-member-since');
  const profileCloseBtn = $('pc-profile-close');
  const myAvatarImg = $('pc-my-avatar-img');


  const profileEditModal = $('pc-profile-edit-modal');
  const editAvatar = $('pc-edit-avatar');
  const editAvatarImg = $('pc-edit-avatar-img');
  const editAvatarBtn = $('pc-edit-avatar-btn');
  const editAvatarFile = $('pc-edit-avatar-file');
  const editAvatarRemove = $('pc-edit-avatar-remove');
  const editBio = $('pc-edit-bio');
  const editBioCount = $('pc-edit-bio-count');
  const framePicker = $('pc-frame-picker');
  const profileEditSave = $('pc-profile-edit-save');
  const profileEditCancel = $('pc-profile-edit-cancel');
  const editProfileBtn = $('pc-edit-profile-btn');
  const upLeft = $('pc-up-left');


  const emojiPickerEl = $('pc-emoji-picker');
  const emojiGridEl = $('pc-emoji-grid');
  const replyBarEl = $('pc-reply-bar');
  const replyBarText = $('pc-reply-bar-text');
  const replyBarClose = $('pc-reply-bar-close');
  const settingsModal = $('pc-settings-modal');
  const statusSelector = $('pc-status-selector');
  const statusDotUser = $('pc-user-status-dot');


  const STORAGE_IDENTITY = 'peercom_identity';
  const STORAGE_CONTACTS = 'peercom_contacts';
  const STORAGE_PROFILE = 'peercom_profile';
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const CHUNK_SIZE = 64 * 1024;
  const MAX_GROUP_SIZE = 8;
  const MAX_AVATAR_SIZE = 256 * 1024;
  const STORAGE_SETTINGS = 'peercom_settings';
  const STORAGE_USER_STATUS = 'peercom_status';
  const COMMON_EMOJIS = ['😀','😂','😍','🥺','😎','🤔','👍','👎','❤️','🔥','🎉','💯','😢','😡','👀','🙏','✅','❌','⭐','💀','🤡','😭','🥰','😏','🫡','💔','😱','🤝','🫠','👏'];


  let peer = null;
  let myKeyPair = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT = 5;


  let chatMode = 'dm';


  let connection = null;
  let sharedKey = null;
  let typingTimeout = null;
  let isTyping = false;
  let peerIdentity = null;


  let identity = null;
  let isAnonymous = false;


  let contacts = [];
  let pendingContactRequest = null;


  let currentCall = null;
  let localStream = null;
  let isMuted = false;
  let callTimerInterval = null;
  let callStartTime = null;
  let pendingIncomingCall = null;


  let screenCall = null;
  let screenStream = null;
  let isScreenSharing = false;
  let pendingIncomingScreen = null;


  let msgIdCounter = 0;
  let replyingTo = null;
  let editingMsgId = null;
  let userStatus = 'online';
  let settings = { sounds: true, desktopNotif: false, theme: 'dark', localStorageEnabled: false, shareStatus: true, fontSize: 15 };
  let notifSound = null;
  let peerLocalStorageEnabled = false;


  const activeTransfers = new Map();





  let groupConnections = new Map();
  let groupSharedKeys = new Map();
  let groupMembers = new Map();
  let groupInfo = null;




  let serverInfo = null;
  let isServerHost = false;
  let serverClients = new Map();
  let serverConn = null;
  let serverSharedKey = null;
  let serverMembers = new Map();


  const subtle = window.crypto.subtle;

  async function generateKeyPair() {
    return subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
  }

  async function exportPublicKey(key) {
    const raw = await subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
  }

  async function importPublicKey(b64) {
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return subtle.importKey('raw', raw, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  }

  async function deriveSharedKey(privateKey, peerPublicKey) {
    return subtle.deriveKey(
      { name: 'ECDH', public: peerPublicKey },
      privateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptMessage(text, key) {
    const k = key || sharedKey;
    if (!k) return null;
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(text));
    return { iv: b64Encode(iv), ct: b64Encode(new Uint8Array(ct)) };
  }

  async function decryptMessage(payload, key) {
    const k = key || sharedKey;
    if (!k) return null;
    try {
      const iv = b64Decode(payload.iv);
      const ct = b64Decode(payload.ct);
      const pt = await subtle.decrypt({ name: 'AES-GCM', iv }, k, ct);
      return new TextDecoder().decode(pt);
    } catch { return null; }
  }

  async function encryptBytes(data, key) {
    const k = key || sharedKey;
    if (!k) return null;
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, k, data);
    return { iv: b64Encode(iv), ct: b64Encode(new Uint8Array(ct)) };
  }

  async function decryptBytes(payload, key) {
    const k = key || sharedKey;
    if (!k) return null;
    try {
      const iv = b64Decode(payload.iv);
      const ct = b64Decode(payload.ct);
      return await subtle.decrypt({ name: 'AES-GCM', iv }, k, ct);
    } catch { return null; }
  }

  function b64Encode(bytes) { return btoa(String.fromCharCode(...bytes)); }
  function b64Decode(str) { return Uint8Array.from(atob(str), c => c.charCodeAt(0)); }


  function loadIdentity() {
    try {
      const raw = localStorage.getItem(STORAGE_IDENTITY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveIdentity(id) {
    localStorage.setItem(STORAGE_IDENTITY, JSON.stringify(id));
  }

  function loadContacts() {
    try {
      const raw = localStorage.getItem(STORAGE_CONTACTS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveContacts(list) {
    localStorage.setItem(STORAGE_CONTACTS, JSON.stringify(list));
  }


  const HYPESQUAD_HOUSES = {
    anemo:   { name: 'Anémo',   emoji: '🍃', color: '#87ceeb' },
    geo:     { name: 'Géo',     emoji: '🌍', color: '#6b9e4f' },
    electro: { name: 'Électro', emoji: '⚡',  color: '#8b5cf6' },
    dendro:  { name: 'Dendro',  emoji: '🌸', color: '#86efac' },
    hydro:   { name: 'Hydro',   emoji: '💧', color: '#5b8dff' },
    pyro:    { name: 'Pyro',    emoji: '🔥', color: '#ef4444' },
    cryo:    { name: 'Cryo',    emoji: '❄️',  color: '#93c5fd' },
    erudis:  { name: 'Érudis',  emoji: '🔮', color: '#c4a747' }
  };

  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_PROFILE);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function saveProfile(p) {
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(p));
  }

  function getHypesquadData() {
    try {
      const raw = localStorage.getItem('vs-hypesquad-house');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function resizeImage(file, maxW, maxH, maxBytes) {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) return reject(new Error('Image trop lourde (max 5 Mo)'));
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          let quality = 0.85;
          let result = canvas.toDataURL('image/webp', quality);
          while (result.length > maxBytes && quality > 0.3) {
            quality -= 0.1;
            result = canvas.toDataURL('image/webp', quality);
          }
          if (result.length > maxBytes) return reject(new Error('Avatar trop volumineux après compression'));
          resolve(result);
        };
        img.onerror = () => reject(new Error('Image invalide'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Lecture du fichier échouée'));
      reader.readAsDataURL(file);
    });
  }


  function loadSettings() {
    try { const r = localStorage.getItem(STORAGE_SETTINGS); return r ? JSON.parse(r) : { sounds: true, desktopNotif: false, theme: 'dark', localStorageEnabled: false, shareStatus: true, fontSize: 15 }; }
    catch { return { sounds: true, desktopNotif: false, theme: 'dark', localStorageEnabled: false, shareStatus: true, fontSize: 15 }; }
  }
  function saveSettings(s) { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(s)); }


  const STORAGE_MESSAGES_PREFIX = 'peercom_msgs_';
  function canSaveMessages() {
    if (!settings.localStorageEnabled) return false;
    if (chatMode === 'dm') return peerLocalStorageEnabled;
    if (chatMode === 'server') return true;

    return false;
  }
  function saveMessageToLocal(convId, msgObj) {
    if (!canSaveMessages()) return;
    const key = STORAGE_MESSAGES_PREFIX + convId;
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(msgObj);

      if (existing.length > 500) existing.splice(0, existing.length - 500);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {  }
  }
  function loadMessagesFromLocal(convId) {
    const key = STORAGE_MESSAGES_PREFIX + convId;
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function clearLocalMessages(convId) {
    if (convId) localStorage.removeItem(STORAGE_MESSAGES_PREFIX + convId);
  }

  function loadUserStatus() {
    return localStorage.getItem(STORAGE_USER_STATUS) || 'online';
  }
  function saveUserStatus(s) { localStorage.setItem(STORAGE_USER_STATUS, s); }

  function playNotifSound() {
    if (!settings.sounds) return;
    if (!notifSound) {
      notifSound = new Audio('data:audio/wav;base64,UklGRl9vT19teleXBl');

      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch {}
      return;
    }
  }

  function sendDesktopNotif(title, body) {
    if (!settings.desktopNotif) return;
    if (document.hasFocus()) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.avif' });
    }
  }

  function genMsgId() { return 'msg-' + (++msgIdCounter) + '-' + Date.now(); }

  function formatMsgText(text) {

    let h = escapeHTML(text);
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    h = h.replace(/~~(.+?)~~/g, '<del>$1</del>');
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\|\|(.+?)\|\|/g, '<span class="pc-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');

    h = h.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return h;
  }


  function generatePeerId() {
    const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const seg = () => { let s = ''; for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)]; return s; };
    return 'pc-' + seg() + '-' + seg() + '-' + seg();
  }

  async function initPeer() {
    if (typeof Peer === 'undefined') {
      setLandingStatus('error', 'PeerJS non disponible. Rechargez la page.');
      return;
    }

    myKeyPair = await generateKeyPair();

    const myId = isAnonymous || !identity ? generatePeerId() : identity.id;
    peer = new Peer(myId, {
      host: '127.0.0.1',
      port: 9000,
      secure: false,
      path: '/peercom',
      key: 'peerjs',
      pingInterval: 5000
    });

    peer.on('open', (id) => {
      myIdEl.textContent = id;
      setLandingStatus('online', 'Prêt à recevoir des connexions');
      reconnectAttempts = 0;
    });

    peer.on('connection', (conn) => {
      const meta = conn.metadata || {};


      if (meta.mode === 'group' && meta.groupId) {
        if (groupInfo && groupInfo.id === meta.groupId) {
          handleGroupIncoming(conn, meta);
        } else {
          conn.close();
        }
        return;
      }


      if (meta.mode === 'server' && meta.serverId) {
        if (isServerHost && serverInfo && serverInfo.id === meta.serverId) {
          handleServerClientJoin(conn, meta);
        } else {
          conn.close();
        }
        return;
      }


      if (chatMode !== 'dm' || connection) { conn.close(); return; }
      handleConnection(conn);
    });

    peer.on('call', (call) => {
      const meta = call.metadata || {};
      if (meta.type === 'screen') {
        pendingIncomingScreen = call;
        showIncomingModal(meta.pseudo || call.peer, 'Partage d\'écran entrant...');
      } else {
        pendingIncomingCall = call;
        showIncomingModal(meta.pseudo || call.peer, 'Appel vocal entrant...');
      }
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        peer.destroy();
        if (!isAnonymous && identity) {
          identity.id = generatePeerId();
          saveIdentity(identity);
          updateIdentityUI();
        }
        initPeer();
        return;
      }
      if (err.type === 'peer-unavailable') {
        toast('Pair introuvable. Vérifiez l\'identifiant.', 'error');
        setLandingStatus('online', 'Prêt à recevoir des connexions');
        connectBtn.disabled = false;
        return;
      }
      console.error('PeerJS error:', err);
      if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'socket-closed') {
        setLandingStatus('error', 'Serveur de signalisation indisponible.');
      } else {
        setLandingStatus('error', 'Erreur : ' + (err.message || err.type));
      }
    });

    peer.on('disconnected', () => {
      if (peer.destroyed) return;
      reconnectAttempts++;
      if (reconnectAttempts <= MAX_RECONNECT) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000);
        setLandingStatus('error', 'Déconnecté. Reconnexion ' + reconnectAttempts + '/' + MAX_RECONNECT + '...');
        setTimeout(() => { if (peer && !peer.destroyed && peer.disconnected) peer.reconnect(); }, delay);
      } else {
        setLandingStatus('error', 'Impossible de se connecter au serveur. Rechargez la page.');
        toast('Serveur de signalisation injoignable après ' + MAX_RECONNECT + ' tentatives.', 'error');
      }
    });
  }





  async function handleConnection(conn) {
    connection = conn;
    chatMode = 'dm';
    setLandingStatus('online', 'Connexion en cours...');

    conn.on('open', async () => {
      const pubKeyB64 = await exportPublicKey(myKeyPair.publicKey);
      conn.send({ type: 'key-exchange', publicKey: pubKeyB64 });
      const idPayload = buildIdentityPayload();
      if (idPayload) conn.send(idPayload);
      conn.send({ type: 'local-storage-pref', enabled: !!settings.localStorageEnabled });
    });

    conn.on('data', async (data) => {
      if (!data || typeof data !== 'object') return;
      await handleDMData(data, conn);
    });

    conn.on('close', () => {
      addSystemMessage('Le pair a quitté la conversation.');
      toast('Pair déconnecté.', 'info');
      endCall();
      endScreenShare();
      cleanupDM();
      showLandingView();
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      addSystemMessage('Erreur de connexion.');
      endCall();
      endScreenShare();
      cleanupDM();
      showLandingView();
    });
  }

  async function handleDMData(data, conn) {
    switch (data.type) {
      case 'key-exchange': {
        if (sharedKey) break;
        try {
          const peerPubKey = await importPublicKey(data.publicKey);
          sharedKey = await deriveSharedKey(myKeyPair.privateKey, peerPubKey);
          showChatView(conn.peer);
          addSystemMessage('Chiffrement de bout en bout établi (ECDH P-256 + AES-256-GCM)');
          toast('Connexion chiffrée établie !', 'success');
        } catch (e) {
          console.error('Key exchange failed:', e);
          toast('Échec de l\'échange de clés.', 'error');
          conn.close();
          cleanupDM();
        }
        break;
      }

      case 'identity': {
        if (data.pseudo && typeof data.pseudo === 'string') {
          peerIdentity = {
            pseudo: data.pseudo.slice(0, 32),
            peerId: data.peerId || conn.peer,
            avatar: (typeof data.avatar === 'string' && data.avatar.startsWith('data:image/')) ? data.avatar : null,
            avatarFrame: data.avatarFrame || 'none',
            bio: (typeof data.bio === 'string') ? data.bio.slice(0, 190) : '',
            badges: Array.isArray(data.badges) ? data.badges.slice(0, 10) : [],
            hypesquad: (data.hypesquad && typeof data.hypesquad === 'object') ? data.hypesquad : null,
            created: (typeof data.created === 'number') ? data.created : null
          };
          chatPeerName.textContent = peerIdentity.pseudo;
          msgInput.placeholder = 'Envoyer un message \u00e0 @' + peerIdentity.pseudo;
          const avatar = $('pc-peer-avatar');
          if (avatar) {
            if (peerIdentity.avatar) {
              avatar.innerHTML = `<img src="${peerIdentity.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
            } else {
              avatar.textContent = peerIdentity.pseudo[0].toUpperCase();
            }
          }
        }
        break;
      }

      case 'encrypted-msg': {
        const raw = await decryptMessage(data.payload);
        if (raw !== null) {
          try {
            const parsed = JSON.parse(raw);
            addChatMessage(parsed.text, 'peer', data.timestamp, { msgId: parsed.msgId, replyTo: parsed.replyTo });
          } catch {

            addChatMessage(raw, 'peer', data.timestamp);
          }
        } else {
          addSystemMessage('Message reçu mais impossible à déchiffrer.');
        }
        break;
      }

      case 'msg-action': {
        const raw = await decryptMessage(data.payload);
        if (raw) {
          try {
            const action = JSON.parse(raw);
            if (action.action === 'edit' && action.msgId) {
              const el = messagesEl.querySelector('[data-msg-id="' + action.msgId + '"]');
              if (el) {
                el.dataset.rawText = action.text;
                const textEl = el.querySelector('.pc-msg-text');
                if (textEl) textEl.innerHTML = formatMsgText(action.text) + ' <span class="pc-msg-edited">(modifié)</span>';
              }
            } else if (action.action === 'delete' && action.msgId) {
              const el = messagesEl.querySelector('[data-msg-id="' + action.msgId + '"]');
              if (el) {
                const textEl = el.querySelector('.pc-msg-text');
                if (textEl) { textEl.textContent = 'Message supprimé'; textEl.classList.add('pc-msg-deleted-text'); }
                el.classList.add('pc-msg-deleted');
              }
            } else if (action.action === 'react' && action.msgId) {
              addReactionToMsg(action.msgId, action.emoji, peerIdentity?.pseudo || 'Pair');
            }
          } catch {}
        }
        break;
      }

      case 'user-status': {
        updatePeerStatusDot(data.status);
        break;
      }

      case 'local-storage-pref': {
        peerLocalStorageEnabled = !!data.enabled;
        const note = $('pc-set-local-storage-note');
        if (note) note.hidden = peerLocalStorageEnabled || !settings.localStorageEnabled;
        break;
      }

      case 'typing': {
        showPeerTyping(data.typing);
        break;
      }

      case 'file-offer': {
        if (data.size > MAX_FILE_SIZE) {
          connection.send({ type: 'file-reject', fileId: data.fileId });
          addSystemMessage('Fichier refusé : taille supérieure à 100 Mo.');
          break;
        }
        activeTransfers.set(data.fileId, {
          name: sanitizeFilename(data.name),
          size: data.size,
          mime: data.mime,
          totalChunks: data.totalChunks,
          chunks: [],
          received: 0
        });
        connection.send({ type: 'file-accept', fileId: data.fileId });
        addFileCard(data.fileId, sanitizeFilename(data.name), data.size, 'peer', 0);
        break;
      }

      case 'file-accept': {
        const transfer = activeTransfers.get(data.fileId);
        if (transfer && transfer.sending) {
          sendFileChunks(data.fileId);
        }
        break;
      }

      case 'file-reject': {
        activeTransfers.delete(data.fileId);
        addSystemMessage('Le pair a refusé le fichier.');
        break;
      }

      case 'file-chunk': {
        const ft = activeTransfers.get(data.fileId);
        if (!ft) break;
        const decrypted = await decryptBytes(data.payload);
        if (decrypted) {
          ft.chunks[data.index] = new Uint8Array(decrypted);
          ft.received++;
          updateFileProgress(data.fileId, ft.received / ft.totalChunks);
        }
        break;
      }

      case 'file-complete': {
        const ft2 = activeTransfers.get(data.fileId);
        if (!ft2) break;
        const blob = new Blob(ft2.chunks, { type: ft2.mime || 'application/octet-stream' });
        finalizeFileCard(data.fileId, blob, ft2.name);
        activeTransfers.delete(data.fileId);
        break;
      }

      case 'contact-request': {
        if (isAnonymous) {
          connection.send({ type: 'contact-reject' });
          break;
        }
        pendingContactRequest = { pseudo: data.pseudo, peerId: data.peerId };
        contactRequestText.textContent = `"${escapeHTML(data.pseudo)}" souhaite vous ajouter en contact.`;
        contactModal.hidden = false;
        break;
      }

      case 'contact-accept': {
        const existing = contacts.find(c => c.peerId === data.peerId);
        if (!existing) {
          contacts.push({ peerId: data.peerId, pseudo: data.pseudo, addedAt: Date.now() });
          saveContacts(contacts);
          renderContacts();
        }
        toast('Contact ajouté : ' + escapeHTML(data.pseudo), 'success');
        break;
      }

      case 'contact-reject': {
        toast('Demande de contact refusée.', 'info');
        break;
      }
    }
  }

  function connectToPeer(peerId) {
    const id = (peerId || peerInput.value).trim();
    if (!id) { toast('Entrez un identifiant de pair.', 'error'); return; }
    if (!peer || peer.destroyed) { toast('P2P non initialisé. Rechargez la page.', 'error'); return; }
    if (id === peer.id) { toast('Vous ne pouvez pas vous connecter à vous-même.', 'error'); return; }
    if (connection) { toast('Déjà connecté. Déconnectez d\'abord.', 'info'); return; }

    connectBtn.disabled = true;
    setLandingStatus('online', 'Connexion à ' + id + '...');
    const conn = peer.connect(id, { reliable: true });
    handleConnection(conn);
  }

  function disconnectPeer() {
    if (chatMode === 'group') { leaveGroup(); return; }
    if (chatMode === 'server') { leaveServer(); return; }
    endCall();
    endScreenShare();
    if (connection) connection.close();
    cleanupDM();
    addSystemMessage('Vous avez quitté la conversation.');
    showLandingView();
  }

  function cleanupDM() {
    connection = null;
    sharedKey = null;
    isTyping = false;
    peerIdentity = null;
    if (typingTimeout) clearTimeout(typingTimeout);
    activeTransfers.clear();
  }





  function createGroup(name) {
    const gId = 'grp-' + generatePeerId().slice(3);
    groupInfo = { id: gId, name: name || 'Groupe', creatorId: peer.id };
    chatMode = 'group';
    const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
    groupMembers.set(peer.id, { pseudo: myPseudo, peerId: peer.id });

    showGroupChatView();
    addSystemMessage('Groupe « ' + escapeHTML(groupInfo.name) + ' » créé.');
    addSystemMessage('ID du groupe : ' + groupInfo.id);
    addSystemMessage('Partagez cet ID pour inviter des participants (max ' + MAX_GROUP_SIZE + ').');
    toast('Groupe créé !', 'success');
    renderMembers();
  }

  function joinGroup(groupId) {
    const gId = groupId.trim();
    if (!gId) { toast('Entrez l\'ID du groupe.', 'error'); return; }
    if (!peer || peer.destroyed) { toast('P2P non initialisé.', 'error'); return; }


    chatMode = 'group';
    groupInfo = { id: gId, name: 'Groupe', creatorId: null };
    const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
    groupMembers.set(peer.id, { pseudo: myPseudo, peerId: peer.id });




    const creatorId = 'pc-' + gId.slice(4);
    if (creatorId === peer.id) { toast('Vous ne pouvez pas rejoindre votre propre groupe.', 'error'); chatMode = 'dm'; groupInfo = null; return; }

    setLandingStatus('online', 'Connexion au groupe...');
    const conn = peer.connect(creatorId, {
      reliable: true,
      metadata: { mode: 'group', groupId: gId, pseudo: myPseudo, peerId: peer.id }
    });

    setupGroupConnection(conn, creatorId);
  }

  function handleGroupIncoming(conn, meta) {
    if (!groupInfo) { conn.close(); return; }

    if (groupMembers.size >= MAX_GROUP_SIZE) {
      conn.on('open', () => {
        conn.send({ type: 'group-full' });
        setTimeout(() => conn.close(), 500);
      });
      return;
    }

    setupGroupConnection(conn, conn.peer);


    conn.on('open', () => {
      const members = [];
      for (const [pid, info] of groupMembers) {
        if (pid !== conn.peer) members.push({ peerId: pid, pseudo: info.pseudo });
      }
      conn.send({ type: 'group-members', members, groupName: groupInfo.name, groupId: groupInfo.id });
    });
  }

  function setupGroupConnection(conn, remotePeerId) {
    groupConnections.set(remotePeerId, conn);

    conn.on('open', async () => {

      const pubKeyB64 = await exportPublicKey(myKeyPair.publicKey);
      conn.send({ type: 'key-exchange', publicKey: pubKeyB64 });
      const idPayload = buildIdentityPayload();
      if (idPayload) conn.send(idPayload);
    });

    conn.on('data', async (data) => {
      if (!data || typeof data !== 'object') return;
      await handleGroupData(data, conn, remotePeerId);
    });

    conn.on('close', () => {
      const info = groupMembers.get(remotePeerId);
      const name = info?.pseudo || remotePeerId;
      groupConnections.delete(remotePeerId);
      groupSharedKeys.delete(remotePeerId);
      groupMembers.delete(remotePeerId);
      if (chatMode === 'group') {
        addSystemMessage(escapeHTML(name) + ' a quitté le groupe.');
        renderMembers();
      }
    });

    conn.on('error', () => {
      groupConnections.delete(remotePeerId);
      groupSharedKeys.delete(remotePeerId);
      groupMembers.delete(remotePeerId);
      if (chatMode === 'group') renderMembers();
    });
  }

  async function handleGroupData(data, conn, remotePeerId) {
    switch (data.type) {
      case 'key-exchange': {
        if (groupSharedKeys.has(remotePeerId)) break;
        try {
          const peerPubKey = await importPublicKey(data.publicKey);
          const sk = await deriveSharedKey(myKeyPair.privateKey, peerPubKey);
          groupSharedKeys.set(remotePeerId, sk);

          if (chatMode === 'group' && chatSection.hidden) {
            showGroupChatView();
          }
          const info = groupMembers.get(remotePeerId);
          addSystemMessage('E2EE établi avec ' + escapeHTML(info?.pseudo || remotePeerId));
          renderMembers();
        } catch (e) {
          console.error('Group key exchange failed:', e);
        }
        break;
      }

      case 'identity': {
        if (data.pseudo && typeof data.pseudo === 'string') {
          groupMembers.set(remotePeerId, { pseudo: data.pseudo.slice(0, 32), peerId: data.peerId || remotePeerId });
          addSystemMessage(escapeHTML(data.pseudo.slice(0, 32)) + ' a rejoint le groupe.');
          renderMembers();
        }
        break;
      }

      case 'group-members': {

        if (data.groupName) groupInfo.name = data.groupName;
        if (data.groupId) groupInfo.id = data.groupId;

        showGroupChatView();
        addSystemMessage('Connecté au groupe « ' + escapeHTML(groupInfo.name) + ' »');

        const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
        for (const m of (data.members || [])) {
          if (m.peerId === peer.id) continue;
          if (groupConnections.has(m.peerId)) continue;
          groupMembers.set(m.peerId, { pseudo: m.pseudo, peerId: m.peerId });

          const c = peer.connect(m.peerId, {
            reliable: true,
            metadata: { mode: 'group', groupId: groupInfo.id, pseudo: myPseudo, peerId: peer.id }
          });
          setupGroupConnection(c, m.peerId);
        }
        renderMembers();
        break;
      }

      case 'group-full': {
        toast('Le groupe est plein (max ' + MAX_GROUP_SIZE + ' participants).', 'error');
        cleanupGroup();
        showLandingView();
        break;
      }

      case 'encrypted-msg': {
        const sk = groupSharedKeys.get(remotePeerId);
        if (!sk) break;
        const text = await decryptMessage(data.payload, sk);
        if (text !== null) {
          const info = groupMembers.get(remotePeerId);
          addGroupMessage(text, info?.pseudo || remotePeerId, data.timestamp);
        }
        break;
      }

      case 'typing': {

        if (data.typing) {
          const info = groupMembers.get(remotePeerId);
          showPeerTyping(true, info?.pseudo);
        } else {
          showPeerTyping(false);
        }
        break;
      }
    }
  }

  async function sendGroupMessage(text) {
    const truncated = text.slice(0, 5000);
    const timestamp = Date.now();

    for (const [pid, conn] of groupConnections) {
      const sk = groupSharedKeys.get(pid);
      if (!sk || !conn.open) continue;
      const payload = await encryptMessage(truncated, sk);
      if (payload) conn.send({ type: 'encrypted-msg', payload, timestamp });
    }

    addChatMessage(truncated, 'me', timestamp);
  }

  function showGroupChatView() {
    landing.classList.add('has-chat');
    chatSection.hidden = false;
    if (featuresSection) featuresSection.hidden = true;
    if (howSection) howSection.hidden = true;
    chatPeerName.textContent = groupInfo?.name || 'Groupe';


    const avatar = $('pc-peer-avatar');
    if (avatar) avatar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2"/></svg>';

    connStatus.textContent = 'Groupe';
    connStatus.className = 'pc-connection-status connected';
    msgInput.disabled = false;
    sendBtn.disabled = false;
    callBtn.disabled = true;
    screenshareBtn.disabled = true;
    addContactBtn.disabled = true;
    membersBtn.hidden = false;
    msgInput.focus();
  }

  function leaveGroup() {
    for (const [, conn] of groupConnections) {
      if (conn.open) conn.close();
    }
    addSystemMessage('Vous avez quitté le groupe.');
    cleanupGroup();
    showLandingView();
  }

  function cleanupGroup() {
    groupConnections.clear();
    groupSharedKeys.clear();
    groupMembers.clear();
    groupInfo = null;
    chatMode = 'dm';
    membersBtn.hidden = true;
    membersDrawer.hidden = true;
  }





  function createServer(name) {
    const sId = 'srv-' + generatePeerId().slice(3);
    serverInfo = { id: sId, name: name || 'Serveur', hostId: peer.id };
    isServerHost = true;
    chatMode = 'server';
    const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
    serverMembers.set(peer.id, { pseudo: myPseudo });

    showServerChatView();
    addSystemMessage('Serveur « ' + escapeHTML(serverInfo.name) + ' » créé.');
    addSystemMessage('ID du serveur : ' + serverInfo.id);
    addSystemMessage('Partagez cet ID pour inviter des participants.');
    toast('Serveur créé !', 'success');
    renderMembers();
  }

  function joinServer(serverId) {
    const sId = serverId.trim();
    if (!sId) { toast('Entrez l\'ID du serveur.', 'error'); return; }
    if (!peer || peer.destroyed) { toast('P2P non initialisé.', 'error'); return; }

    chatMode = 'server';
    isServerHost = false;
    serverInfo = { id: sId, name: 'Serveur', hostId: null };
    const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
    serverMembers.set(peer.id, { pseudo: myPseudo });

    const hostId = 'pc-' + sId.slice(4);
    if (hostId === peer.id) { toast('Vous ne pouvez pas rejoindre votre propre serveur.', 'error'); chatMode = 'dm'; serverInfo = null; return; }

    setLandingStatus('online', 'Connexion au serveur...');
    const conn = peer.connect(hostId, {
      reliable: true,
      metadata: { mode: 'server', serverId: sId, pseudo: myPseudo, peerId: peer.id }
    });

    serverConn = conn;

    conn.on('open', async () => {
      const pubKeyB64 = await exportPublicKey(myKeyPair.publicKey);
      conn.send({ type: 'key-exchange', publicKey: pubKeyB64 });
      const idPayload = buildIdentityPayload();
      if (idPayload) conn.send(idPayload);
    });

    conn.on('data', async (data) => {
      if (!data || typeof data !== 'object') return;
      await handleServerClientData(data, conn);
    });

    conn.on('close', () => {
      addSystemMessage('Déconnecté du serveur.');
      toast('Serveur déconnecté.', 'info');
      cleanupServer();
      showLandingView();
    });

    conn.on('error', () => {
      toast('Erreur de connexion au serveur.', 'error');
      cleanupServer();
      showLandingView();
    });
  }


  function handleServerClientJoin(conn, meta) {
    const remotePeerId = conn.peer;
    const clientState = { conn, sharedKey: null, pseudo: meta.pseudo || remotePeerId, keyPair: null };
    serverClients.set(remotePeerId, clientState);

    conn.on('open', async () => {
      const pubKeyB64 = await exportPublicKey(myKeyPair.publicKey);
      conn.send({ type: 'key-exchange', publicKey: pubKeyB64 });
      conn.send({ type: 'server-info', name: serverInfo.name, serverId: serverInfo.id });
      const idPayload = buildIdentityPayload();
      if (idPayload) conn.send(idPayload);
    });

    conn.on('data', async (data) => {
      if (!data || typeof data !== 'object') return;
      await handleServerHostData(data, conn, remotePeerId);
    });

    conn.on('close', () => {
      const info = serverClients.get(remotePeerId);
      const name = info?.pseudo || remotePeerId;
      serverClients.delete(remotePeerId);
      serverMembers.delete(remotePeerId);
      if (chatMode === 'server') {
        addSystemMessage(escapeHTML(name) + ' a quitté le serveur.');
        broadcastServerMembers();
        renderMembers();
      }
    });

    conn.on('error', () => {
      serverClients.delete(remotePeerId);
      serverMembers.delete(remotePeerId);
      if (chatMode === 'server') {
        broadcastServerMembers();
        renderMembers();
      }
    });
  }


  async function handleServerHostData(data, conn, remotePeerId) {
    const client = serverClients.get(remotePeerId);

    switch (data.type) {
      case 'key-exchange': {
        if (client && client.sharedKey) break;
        try {
          const peerPubKey = await importPublicKey(data.publicKey);
          const sk = await deriveSharedKey(myKeyPair.privateKey, peerPubKey);
          if (client) client.sharedKey = sk;
          serverMembers.set(remotePeerId, { pseudo: client?.pseudo || remotePeerId });
          addSystemMessage(escapeHTML(client?.pseudo || remotePeerId) + ' a rejoint le serveur.');
          broadcastServerMembers();
          renderMembers();
        } catch (e) {
          console.error('Server key exchange failed:', e);
        }
        break;
      }

      case 'identity': {
        if (data.pseudo && typeof data.pseudo === 'string' && client) {
          client.pseudo = data.pseudo.slice(0, 32);
          serverMembers.set(remotePeerId, { pseudo: client.pseudo });
          broadcastServerMembers();
          renderMembers();
        }
        break;
      }

      case 'encrypted-msg': {

        if (!client?.sharedKey) break;
        const text = await decryptMessage(data.payload, client.sharedKey);
        if (text !== null) {
          addGroupMessage(text, client.pseudo || remotePeerId, data.timestamp);

          for (const [pid, c] of serverClients) {
            if (pid === remotePeerId || !c.sharedKey || !c.conn.open) continue;
            const relayPayload = await encryptMessage(text, c.sharedKey);
            if (relayPayload) {
              c.conn.send({ type: 'server-relay-msg', payload: relayPayload, sender: client.pseudo || remotePeerId, timestamp: data.timestamp });
            }
          }
        }
        break;
      }

      case 'typing': {

        for (const [pid, c] of serverClients) {
          if (pid === remotePeerId || !c.conn.open) continue;
          c.conn.send({ type: 'typing', typing: data.typing, sender: client?.pseudo || remotePeerId });
        }
        if (data.typing) {
          showPeerTyping(true, client?.pseudo);
        } else {
          showPeerTyping(false);
        }
        break;
      }
    }
  }


  async function handleServerClientData(data, conn) {
    switch (data.type) {
      case 'key-exchange': {
        if (serverSharedKey) break;
        try {
          const peerPubKey = await importPublicKey(data.publicKey);
          serverSharedKey = await deriveSharedKey(myKeyPair.privateKey, peerPubKey);
          showServerChatView();
          addSystemMessage('Connecté au serveur. E2EE établi avec l\'hôte.');
          toast('Connecté au serveur !', 'success');
        } catch (e) {
          console.error('Server key exchange failed:', e);
          toast('Échec de la connexion au serveur.', 'error');
          cleanupServer();
          showLandingView();
        }
        break;
      }

      case 'server-info': {
        if (data.name) serverInfo.name = data.name;
        if (data.serverId) serverInfo.id = data.serverId;
        chatPeerName.textContent = serverInfo.name;
        break;
      }

      case 'identity': {
        if (data.pseudo && typeof data.pseudo === 'string') {
          serverInfo.hostId = data.peerId || conn.peer;
          serverMembers.set(conn.peer, { pseudo: data.pseudo.slice(0, 32) });
          renderMembers();
        }
        break;
      }

      case 'server-relay-msg': {
        if (!serverSharedKey) break;
        const text = await decryptMessage(data.payload, serverSharedKey);
        if (text !== null) {
          addGroupMessage(text, data.sender || 'Pair', data.timestamp);
        }
        break;
      }

      case 'server-members': {

        serverMembers.clear();
        const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
        serverMembers.set(peer.id, { pseudo: myPseudo });
        for (const m of (data.members || [])) {
          serverMembers.set(m.peerId, { pseudo: m.pseudo });
        }
        renderMembers();
        break;
      }

      case 'typing': {
        if (data.typing) {
          showPeerTyping(true, data.sender);
        } else {
          showPeerTyping(false);
        }
        break;
      }
    }
  }

  function broadcastServerMembers() {
    const members = [];
    for (const [pid, info] of serverMembers) {
      members.push({ peerId: pid, pseudo: info.pseudo });
    }
    for (const [, c] of serverClients) {
      if (c.conn.open) {
        c.conn.send({ type: 'server-members', members });
      }
    }
  }

  async function sendServerMessage(text) {
    const truncated = text.slice(0, 5000);
    const timestamp = Date.now();
    const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');

    if (isServerHost) {

      for (const [, c] of serverClients) {
        if (!c.sharedKey || !c.conn.open) continue;
        const payload = await encryptMessage(truncated, c.sharedKey);
        if (payload) {
          c.conn.send({ type: 'server-relay-msg', payload, sender: myPseudo, timestamp });
        }
      }
    } else {

      if (!serverConn || !serverSharedKey) return;
      const payload = await encryptMessage(truncated, serverSharedKey);
      if (payload) {
        serverConn.send({ type: 'encrypted-msg', payload, timestamp });
      }
    }

    addChatMessage(truncated, 'me', timestamp);
  }

  function showServerChatView() {
    landing.classList.add('has-chat');
    chatSection.hidden = false;
    if (featuresSection) featuresSection.hidden = true;
    if (howSection) howSection.hidden = true;
    chatPeerName.textContent = serverInfo?.name || 'Serveur';

    const avatar = $('pc-peer-avatar');
    if (avatar) avatar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="8" rx="2" stroke="currentColor" stroke-width="2"/><rect x="2" y="14" width="20" height="8" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/></svg>';

    connStatus.textContent = isServerHost ? 'Hôte' : 'Serveur';
    connStatus.className = 'pc-connection-status connected';
    msgInput.disabled = false;
    sendBtn.disabled = false;
    callBtn.disabled = true;
    screenshareBtn.disabled = true;
    addContactBtn.disabled = true;
    membersBtn.hidden = false;
    msgInput.focus();
  }

  function leaveServer() {
    if (isServerHost) {

      for (const [, c] of serverClients) {
        if (c.conn.open) c.conn.close();
      }
    } else {
      if (serverConn && serverConn.open) serverConn.close();
    }
    addSystemMessage('Vous avez quitté le serveur.');
    cleanupServer();
    showLandingView();
  }

  function cleanupServer() {
    serverClients.clear();
    serverMembers.clear();
    serverConn = null;
    serverSharedKey = null;
    serverInfo = null;
    isServerHost = false;
    chatMode = 'dm';
    membersBtn.hidden = true;
    membersDrawer.hidden = true;
  }





  async function startCall() {
    if (!connection || currentCall) return;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      toast('Impossible d\'accéder au micro.', 'error');
      return;
    }
    const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
    currentCall = peer.call(connection.peer, localStream, {
      metadata: { type: 'voice', pseudo: myPseudo }
    });
    setupCallHandlers(currentCall);
    showCallBanner();
    addSystemMessage('Appel vocal en cours...');
  }

  function answerCall(call) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      localStream = stream;
      call.answer(stream);
      currentCall = call;
      setupCallHandlers(call);
      showCallBanner();
      addSystemMessage('Appel vocal connecté.');
    }).catch(() => {
      toast('Impossible d\'accéder au micro.', 'error');
      call.close();
    });
  }

  function setupCallHandlers(call) {
    call.on('stream', (remoteStream) => {
      remoteAudio.srcObject = remoteStream;
    });
    call.on('close', () => {
      endCall();
      addSystemMessage('Appel terminé.');
    });
    call.on('error', () => {
      endCall();
      addSystemMessage('Erreur lors de l\'appel.');
    });
  }

  function endCall() {
    if (currentCall) { currentCall.close(); currentCall = null; }
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
    remoteAudio.srcObject = null;
    isMuted = false;
    muteBtn.classList.remove('muted');
    hideCallBanner();
  }

  function toggleMute() {
    if (!localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
    muteBtn.classList.toggle('muted', isMuted);
  }

  function showCallBanner() {
    callBanner.hidden = false;
    callBtn.classList.add('active');
    callBtn.disabled = true;
    callStartTime = Date.now();
    callTimerInterval = setInterval(updateCallTimer, 1000);
    updateCallTimer();
  }

  function hideCallBanner() {
    callBanner.hidden = true;
    callBtn.classList.remove('active');
    callBtn.disabled = false;
    callStartTime = null;
    if (callTimerInterval) { clearInterval(callTimerInterval); callTimerInterval = null; }
    callTimerEl.textContent = '00:00';
  }

  function updateCallTimer() {
    if (!callStartTime) return;
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    callTimerEl.textContent = m + ':' + s;
  }


  async function startScreenShare() {
    if (!connection || screenCall) return;
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch (e) {
      if (e.name !== 'NotAllowedError') toast('Partage d\'écran non supporté.', 'error');
      return;
    }
    const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
    screenCall = peer.call(connection.peer, screenStream, {
      metadata: { type: 'screen', pseudo: myPseudo }
    });
    isScreenSharing = true;
    screenBanner.hidden = false;
    screenshareBtn.classList.add('active');
    screenshareBtn.disabled = true;
    addSystemMessage('Partage d\'écran en cours...');

    screenStream.getTracks().forEach(track => {
      track.addEventListener('ended', () => endScreenShare());
    });

    screenCall.on('close', () => endScreenShare());
    screenCall.on('error', () => endScreenShare());
  }

  function answerScreenShare(call) {
    call.answer();
    screenCall = call;

    call.on('stream', (remoteStream) => {
      screenVideo.srcObject = remoteStream;
      screenOverlay.hidden = false;
      addSystemMessage('Réception du partage d\'écran...');
    });

    call.on('close', () => {
      closeScreenViewer();
      addSystemMessage('Le partage d\'écran a été arrêté.');
    });
    call.on('error', () => closeScreenViewer());
  }

  function endScreenShare() {
    if (screenCall) { screenCall.close(); screenCall = null; }
    if (screenStream) { screenStream.getTracks().forEach(t => t.stop()); screenStream = null; }
    isScreenSharing = false;
    screenBanner.hidden = true;
    screenshareBtn.classList.remove('active');
    screenshareBtn.disabled = false;
    closeScreenViewer();
  }

  function closeScreenViewer() {
    screenOverlay.hidden = true;
    screenVideo.srcObject = null;
    if (screenCall && !isScreenSharing) { screenCall.close(); screenCall = null; }
    screenshareBtn.classList.remove('active');
    screenshareBtn.disabled = false;
  }


  async function initiateFileTransfer(file) {
    if (chatMode !== 'dm' || !connection || !sharedKey) { toast('Transfert de fichiers disponible en DM uniquement.', 'error'); return; }
    if (file.size > MAX_FILE_SIZE) { toast('Fichier trop volumineux (max 100 Mo).', 'error'); return; }

    const fileId = crypto.randomUUID ? crypto.randomUUID() : generatePeerId();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    activeTransfers.set(fileId, {
      file,
      name: file.name,
      size: file.size,
      totalChunks,
      sent: 0,
      sending: true
    });

    connection.send({
      type: 'file-offer',
      fileId,
      name: file.name,
      size: file.size,
      mime: file.type,
      totalChunks
    });

    addFileCard(fileId, file.name, file.size, 'me', 0);
  }

  async function sendFileChunks(fileId) {
    const ft = activeTransfers.get(fileId);
    if (!ft || !ft.file) return;

    const reader = ft.file.stream().getReader();
    let buffer = new Uint8Array(0);
    let index = 0;

    const sendNext = async () => {
      while (true) {
        if (buffer.length >= CHUNK_SIZE) {
          const chunk = buffer.slice(0, CHUNK_SIZE);
          buffer = buffer.slice(CHUNK_SIZE);
          const encrypted = await encryptBytes(chunk);
          if (!connection) return;
          connection.send({ type: 'file-chunk', fileId, index, payload: encrypted });
          index++;
          ft.sent = index;
          updateFileProgress(fileId, index / ft.totalChunks);
          await new Promise(r => setTimeout(r, 5));
          continue;
        }

        const { done, value } = await reader.read();
        if (done) {
          if (buffer.length > 0) {
            const encrypted = await encryptBytes(buffer);
            if (!connection) return;
            connection.send({ type: 'file-chunk', fileId, index, payload: encrypted });
            index++;
            updateFileProgress(fileId, 1);
          }
          connection.send({ type: 'file-complete', fileId });
          activeTransfers.delete(fileId);
          finalizeFileCardSent(fileId);
          return;
        }

        const merged = new Uint8Array(buffer.length + value.length);
        merged.set(buffer);
        merged.set(value, buffer.length);
        buffer = merged;
      }
    };

    sendNext();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  function sanitizeFilename(name) {
    return String(name || 'fichier').replace(/[<>:"/\\|?*]/g, '_').slice(0, 255);
  }

  function addFileCard(fileId, name, size, sender, progress) {
    messagesEmpty.hidden = true;
    const el = document.createElement('div');
    el.className = 'pc-file-card ' + (sender === 'me' ? 'pc-file-me' : 'pc-file-peer');
    el.id = 'file-' + fileId;
    el.innerHTML = `
      <div class="pc-file-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/></svg>
      </div>
      <div class="pc-file-info">
        <span class="pc-file-name">${escapeHTML(name)}</span>
        <span class="pc-file-meta">${formatFileSize(size)}</span>
        <div class="pc-file-progress"><div class="pc-file-progress-bar" style="width: ${progress * 100}%"></div></div>
      </div>
    `;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function updateFileProgress(fileId, progress) {
    const el = document.getElementById('file-' + fileId);
    if (!el) return;
    const bar = el.querySelector('.pc-file-progress-bar');
    if (bar) bar.style.width = (progress * 100) + '%';
  }

  function finalizeFileCard(fileId, blob, name) {
    const el = document.getElementById('file-' + fileId);
    if (!el) return;
    const progressEl = el.querySelector('.pc-file-progress');
    if (progressEl) progressEl.remove();

    const dlBtn = document.createElement('button');
    dlBtn.className = 'pc-file-download';
    dlBtn.title = 'Télécharger';
    dlBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    dlBtn.addEventListener('click', () => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    });
    el.appendChild(dlBtn);
  }

  function finalizeFileCardSent(fileId) {
    const el = document.getElementById('file-' + fileId);
    if (!el) return;
    const progressEl = el.querySelector('.pc-file-progress');
    if (progressEl) progressEl.remove();
    const meta = el.querySelector('.pc-file-meta');
    if (meta) meta.textContent += ' · Envoyé ✓';
  }


  function renderContacts() {
    contactsListEl.querySelectorAll('.pc-contact-item').forEach(e => e.remove());
    contactsCountEl.textContent = contacts.length;

    if (contacts.length === 0) {
      contactsEmptyEl.hidden = false;
      return;
    }
    contactsEmptyEl.hidden = true;

    contacts.forEach((c, idx) => {
      const el = document.createElement('div');
      el.className = 'pc-contact-item';
      el.innerHTML = `
        <div class="pc-contact-avatar">${escapeHTML((c.pseudo || '?')[0].toUpperCase())}</div>
        <div class="pc-contact-info">
          <span class="pc-contact-pseudo">${escapeHTML(c.pseudo)}</span>
          <span class="pc-contact-id">${escapeHTML(c.peerId)}</span>
        </div>
        <div class="pc-contact-actions">
          <button class="pc-icon-btn pc-contact-connect" title="Connecter" data-peer="${escapeHTML(c.peerId)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 7h3a5 5 0 010 10h-3m-6 0H6A5 5 0 016 7h3M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button class="pc-icon-btn pc-contact-remove" title="Supprimer" data-index="${idx}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      `;
      contactsListEl.appendChild(el);
    });

    contactsListEl.querySelectorAll('.pc-contact-connect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        connectToPeer(btn.dataset.peer);
      });
    });

    contactsListEl.querySelectorAll('.pc-contact-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        contacts.splice(idx, 1);
        saveContacts(contacts);
        renderContacts();
        toast('Contact supprimé.', 'info');
      });
    });
  }

  function sendContactRequest() {
    if (!connection || isAnonymous || !identity) {
      toast('Impossible en mode anonyme.', 'error');
      return;
    }
    const pId = peerIdentity?.peerId || connection.peer;
    if (contacts.find(c => c.peerId === pId)) {
      toast('Ce pair est déjà dans vos contacts.', 'info');
      return;
    }
    connection.send({ type: 'contact-request', pseudo: identity.pseudo, peerId: identity.id });
    toast('Demande de contact envoyée.', 'success');
  }

  function acceptContactRequest() {
    if (!pendingContactRequest || !connection) return;
    const req = pendingContactRequest;
    if (!contacts.find(c => c.peerId === req.peerId)) {
      contacts.push({ peerId: req.peerId, pseudo: req.pseudo, addedAt: Date.now() });
      saveContacts(contacts);
      renderContacts();
    }
    connection.send({ type: 'contact-accept', pseudo: identity.pseudo, peerId: identity.id });
    toast('Contact ajouté : ' + escapeHTML(req.pseudo), 'success');
    pendingContactRequest = null;
    contactModal.hidden = true;
  }

  function rejectContactRequest() {
    if (connection) connection.send({ type: 'contact-reject' });
    pendingContactRequest = null;
    contactModal.hidden = true;
    toast('Demande refusée.', 'info');
  }


  function showIncomingModal(name, typeText) {
    incomingName.textContent = name;
    incomingType.textContent = typeText;
    incomingModal.hidden = false;
  }

  function hideIncomingModal() {
    incomingModal.hidden = true;
    pendingIncomingCall = null;
    pendingIncomingScreen = null;
  }


  function renderMembers() {
    membersListEl.innerHTML = '';
    let members;
    if (chatMode === 'group') {
      members = groupMembers;
    } else if (chatMode === 'server') {
      members = serverMembers;
    } else {
      return;
    }

    membersCountEl.textContent = members.size;

    for (const [pid, info] of members) {
      const el = document.createElement('div');
      const isMe = pid === peer.id;
      const isHost = chatMode === 'server' && ((isServerHost && pid === peer.id) || (!isServerHost && pid === (serverInfo?.hostId || '')));
      el.className = 'pc-member-chip' + (isHost ? ' pc-member-host' : '') + (isMe ? ' pc-member-me' : '');
      el.innerHTML = `
        <div class="pc-member-avatar">${escapeHTML((info.pseudo || '?')[0].toUpperCase())}</div>
        <span>${escapeHTML(info.pseudo || pid)}${isMe ? ' (vous)' : ''}${isHost ? ' ★' : ''}</span>
      `;
      membersListEl.appendChild(el);
    }
  }


  function initIdentity() {
    identity = loadIdentity();
    contacts = loadContacts();

    if (!identity) {
      setupModal.hidden = false;
    } else {
      updateIdentityUI();
    }
    renderContacts();
  }

  function createIdentity(pseudo) {
    const cleanPseudo = pseudo.trim().slice(0, 32) || 'Utilisateur';
    identity = { id: generatePeerId(), pseudo: cleanPseudo, created: Date.now() };
    saveIdentity(identity);
    updateIdentityUI();
    setupModal.hidden = true;
    initPeer();
  }

  function updateIdentityUI() {
    if (!identity) return;
    myPseudoEl.textContent = isAnonymous ? 'Anonyme' : identity.pseudo;
    myAvatarEl.textContent = isAnonymous ? '?' : identity.pseudo[0].toUpperCase();
    myPermanentIdEl.textContent = isAnonymous ? 'ID temporaire' : identity.id;
    updateAvatarUI();
  }

  function toggleAnonymousMode() {
    isAnonymous = anonToggle.checked;
    updateIdentityUI();
    if (connection) disconnectPeer();
    if (peer) peer.destroy();
    myIdEl.textContent = 'Chargement...';
    setLandingStatus('', 'Initialisation...');
    initPeer();
    toast(isAnonymous ? 'Mode anonyme activé.' : 'Mode normal activé.', 'info');
  }


  function setLandingStatus(status, text) {
    statusDot.className = 'pc-status-dot';
    if (status === 'online') statusDot.classList.add('online');
    else if (status === 'error') statusDot.classList.add('error');
    statusText.textContent = text;
  }

  function showChatView(peerId) {
    chatMode = 'dm';
    landing.classList.add('has-chat');
    chatSection.hidden = false;
    if (featuresSection) featuresSection.hidden = true;
    if (howSection) howSection.hidden = true;
    chatPeerName.textContent = peerIdentity?.pseudo || peerId;
    const avatar = $('pc-peer-avatar');
    if (peerIdentity?.pseudo && avatar) {
      avatar.textContent = peerIdentity.pseudo[0].toUpperCase();
    }
    connStatus.textContent = 'Connecté';
    connStatus.className = 'pc-connection-status connected';
    msgInput.disabled = false;
    sendBtn.disabled = false;
    callBtn.disabled = false;
    screenshareBtn.disabled = false;
    addContactBtn.disabled = isAnonymous;
    membersBtn.hidden = true;
    msgInput.placeholder = 'Envoyer un message \u00e0 @' + (peerIdentity?.pseudo || peerId);
    _lastMsgDate = null;
    _lastMsgSender = null;
    _lastMsgTimestamp = 0;
    msgInput.focus();


    if (settings.localStorageEnabled && peerId) {
      const saved = loadMessagesFromLocal(peerId);
      if (saved.length > 0) {
        addSystemMessage('— Historique restauré (' + saved.length + ' messages) —');
        saved.forEach(m => addChatMessage(m.text, m.sender, m.ts, { msgId: m.msgId, skipSave: true }));
      }
    }
  }

  function showLandingView() {
    landing.classList.remove('has-chat');
    chatSection.hidden = true;
    if (featuresSection) featuresSection.hidden = false;
    if (howSection) howSection.hidden = false;
    connectBtn.disabled = false;
    peerInput.disabled = false;
    peerInput.value = '';
    msgInput.disabled = true;
    sendBtn.disabled = true;
    callBtn.disabled = true;
    screenshareBtn.disabled = true;
    addContactBtn.disabled = true;
    membersBtn.hidden = true;
    membersDrawer.hidden = true;
    connStatus.textContent = 'Déconnecté';
    connStatus.className = 'pc-connection-status disconnected';
    typingEl.hidden = true;
    callBanner.hidden = true;
    screenBanner.hidden = true;

    messagesEl.querySelectorAll('.pc-msg, .pc-file-card, .pc-date-sep').forEach(m => m.remove());
    _lastMsgDate = null;
    _lastMsgSender = null;
    _lastMsgTimestamp = 0;
    messagesEmpty.hidden = false;

    setLandingStatus('online', 'Prêt à recevoir des connexions');
    chatMode = 'dm';
  }



  let _lastMsgDate = null;
  function _maybeDateSep(ts) {
    const d = new Date(ts || Date.now());
    const key = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    if (key !== _lastMsgDate) {
      _lastMsgDate = key;
      const sep = document.createElement('div');
      sep.className = 'pc-date-sep';
      sep.innerHTML = '<span>' + key + '</span>';
      messagesEl.appendChild(sep);
    }
  }


  let _lastMsgSender = null;
  let _lastMsgTimestamp = 0;
  function _shouldGroup(sender, ts) {
    const same = sender === _lastMsgSender;
    const close = (ts - _lastMsgTimestamp) < 5 * 60 * 1000;
    _lastMsgSender = sender;
    _lastMsgTimestamp = ts;
    return same && close;
  }

  function addChatMessage(text, sender, timestamp, opts = {}) {
    messagesEmpty.hidden = true;
    const ts = timestamp || Date.now();
    const time = new Date(ts);
    const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = time.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const msgId = opts.msgId || genMsgId();

    _maybeDateSep(ts);
    const grouped = _shouldGroup(sender, ts);

    const el = document.createElement('div');
    el.className = 'pc-msg ' + (sender === 'me' ? 'pc-msg-me' : 'pc-msg-peer') + (grouped ? ' pc-msg-grouped' : '');
    el.dataset.msgId = msgId;
    el.dataset.sender = sender;
    el.dataset.rawText = text;
    el.dataset.ts = ts;


    if (opts.replyTo) {
      const refDiv = document.createElement('div');
      refDiv.className = 'pc-msg-reply-ref';
      refDiv.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 17l-5-5 5-5M4 12h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> <span class="pc-reply-author">' + escapeHTML(opts.replyTo.author) + '</span> <span class="pc-reply-preview">' + escapeHTML(opts.replyTo.text.slice(0, 80)) + '</span>';
      refDiv.onclick = () => {
        const target = messagesEl.querySelector('[data-msg-id="' + opts.replyTo.id + '"]');
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.classList.add('pc-msg-highlight'); setTimeout(() => target.classList.remove('pc-msg-highlight'), 1500); }
      };
      el.appendChild(refDiv);
    }

    if (!grouped) {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'pc-msg-avatar';
      if (sender === 'me') {
        const profile = loadProfile();
        if (profile.avatar) {
          avatarDiv.innerHTML = '<img src="' + profile.avatar + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">';
        } else {
          avatarDiv.textContent = (identity?.pseudo || 'M')[0].toUpperCase();
        }
      } else {
        if (peerIdentity?.avatar) {
          avatarDiv.innerHTML = '<img src="' + peerIdentity.avatar + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">';
        } else {
          avatarDiv.textContent = (peerIdentity?.pseudo || 'P')[0].toUpperCase();
        }
      }
      el.appendChild(avatarDiv);

      const body = document.createElement('div');
      body.className = 'pc-msg-body';
      const head = document.createElement('div');
      head.className = 'pc-msg-head';
      const authorSpan = document.createElement('span');
      authorSpan.className = 'pc-msg-author';
      authorSpan.textContent = sender === 'me' ? (identity?.pseudo || 'Moi') : (peerIdentity?.pseudo || 'Pair');
      const timeSpanH = document.createElement('span');
      timeSpanH.className = 'pc-msg-time';
      timeSpanH.textContent = dateStr + ' ' + timeStr;
      head.appendChild(authorSpan);
      head.appendChild(timeSpanH);
      body.appendChild(head);

      const msgP = document.createElement('div');
      msgP.className = 'pc-msg-text';
      msgP.innerHTML = formatMsgText(text);
      body.appendChild(msgP);


      const reactionsDiv = document.createElement('div');
      reactionsDiv.className = 'pc-msg-reactions';
      body.appendChild(reactionsDiv);

      el.appendChild(body);
    } else {
      const spacer = document.createElement('div');
      spacer.className = 'pc-msg-gutter';
      const hoverTime = document.createElement('span');
      hoverTime.className = 'pc-msg-time-hover';
      hoverTime.textContent = timeStr;
      spacer.appendChild(hoverTime);
      el.appendChild(spacer);

      const msgP = document.createElement('div');
      msgP.className = 'pc-msg-text';
      msgP.innerHTML = formatMsgText(text);
      el.appendChild(msgP);

      const reactionsDiv = document.createElement('div');
      reactionsDiv.className = 'pc-msg-reactions';
      el.appendChild(reactionsDiv);
    }


    const actions = document.createElement('div');
    actions.className = 'pc-msg-actions';
    actions.innerHTML = '<button class="pc-msg-act-btn" data-action="react" title="Réaction">😀</button>'
      + '<button class="pc-msg-act-btn" data-action="reply" title="Répondre"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 17l-5-5 5-5M4 12h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
      + (sender === 'me' ? '<button class="pc-msg-act-btn" data-action="edit" title="Modifier"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17 3a2.83 2.83 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" stroke-width="2"/></svg></button>' : '')
      + '<button class="pc-msg-act-btn" data-action="delete" title="Supprimer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
    el.appendChild(actions);

    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;


    if (sender !== 'me' && !opts.skipSave) {
      playNotifSound();
      sendDesktopNotif(peerIdentity?.pseudo || 'Nouveau message', text.slice(0, 100));
    }


    if (connection?.peer && !opts.skipSave) {
      saveMessageToLocal(connection.peer, { text, sender, ts, msgId });
    }

    return msgId;
  }

  function addGroupMessage(text, senderName, timestamp) {
    messagesEmpty.hidden = true;
    const ts = timestamp || Date.now();
    const time = new Date(ts);
    const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = time.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    _maybeDateSep(ts);
    const senderKey = 'group:' + senderName;
    const grouped = _shouldGroup(senderKey, ts);

    const msgId = genMsgId();
    const el = document.createElement('div');
    el.className = 'pc-msg pc-msg-peer' + (grouped ? ' pc-msg-grouped' : '');
    el.dataset.msgId = msgId;
    el.dataset.sender = 'group:' + senderName;
    el.dataset.rawText = text;
    el.dataset.ts = ts;

    if (!grouped) {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'pc-msg-avatar';
      avatarDiv.textContent = (senderName || 'P')[0].toUpperCase();
      el.appendChild(avatarDiv);

      const body = document.createElement('div');
      body.className = 'pc-msg-body';
      const head = document.createElement('div');
      head.className = 'pc-msg-head';
      const authorSpan = document.createElement('span');
      authorSpan.className = 'pc-msg-author';
      authorSpan.textContent = senderName;
      const timeSpanH = document.createElement('span');
      timeSpanH.className = 'pc-msg-time';
      timeSpanH.textContent = dateStr + ' ' + timeStr;
      head.appendChild(authorSpan);
      head.appendChild(timeSpanH);
      body.appendChild(head);

      const msgP = document.createElement('div');
      msgP.className = 'pc-msg-text';
      msgP.innerHTML = formatMsgText(text);
      body.appendChild(msgP);
      el.appendChild(body);
    } else {
      const spacer = document.createElement('div');
      spacer.className = 'pc-msg-gutter';
      const hoverTime = document.createElement('span');
      hoverTime.className = 'pc-msg-time-hover';
      hoverTime.textContent = timeStr;
      spacer.appendChild(hoverTime);
      el.appendChild(spacer);

      const msgP = document.createElement('div');
      msgP.className = 'pc-msg-text';
      msgP.innerHTML = formatMsgText(text);
      el.appendChild(msgP);
    }

    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addSystemMessage(text) {
    messagesEmpty.hidden = true;
    _lastMsgSender = null;
    const el = document.createElement('div');
    el.className = 'pc-msg pc-msg-system';
    const icon = document.createElement('span');
    icon.className = 'pc-sys-icon';
    icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/></svg>';
    el.appendChild(icon);
    const span = document.createElement('span');
    span.textContent = text;
    el.appendChild(span);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;
    const truncated = text.slice(0, 5000);


    if (editingMsgId) {
      const el = messagesEl.querySelector('[data-msg-id="' + editingMsgId + '"]');
      if (el) {
        el.dataset.rawText = truncated;
        const textEl = el.querySelector('.pc-msg-text');
        if (textEl) textEl.innerHTML = formatMsgText(truncated) + ' <span class="pc-msg-edited">(modifié)</span>';
      }
      if (chatMode === 'dm' && connection && sharedKey) {
        const payload = await encryptMessage(JSON.stringify({ action: 'edit', msgId: editingMsgId, text: truncated }));
        if (payload) connection.send({ type: 'msg-action', payload, timestamp: Date.now() });
      }
      editingMsgId = null;
      msgInput.value = '';
      msgInput.placeholder = msgInput.dataset.origPlaceholder || 'Envoyer un message';
      msgInput.classList.remove('pc-editing');
      msgInput.focus();
      return;
    }

    const msgId = genMsgId();
    const replyData = replyingTo ? { id: replyingTo.id, author: replyingTo.author, text: replyingTo.text } : null;

    if (chatMode === 'group') {
      await sendGroupMessage(truncated);
    } else if (chatMode === 'server') {
      await sendServerMessage(truncated);
    } else {
      if (!connection || !sharedKey) return;
      const payload = await encryptMessage(JSON.stringify({ text: truncated, msgId, replyTo: replyData }));
      if (!payload) { toast('Erreur de chiffrement.', 'error'); return; }
      connection.send({ type: 'encrypted-msg', payload, timestamp: Date.now() });
      addChatMessage(truncated, 'me', Date.now(), { msgId, replyTo: replyData });
    }


    if (replyingTo) {
      replyingTo = null;
      if (replyBarEl) replyBarEl.hidden = true;
    }

    msgInput.value = '';
    msgInput.focus();
    if (isTyping) { isTyping = false; broadcastTyping(false); }
  }

  function handleTypingInput() {
    if (!isTyping) {
      isTyping = true;
      broadcastTyping(true);
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      isTyping = false;
      broadcastTyping(false);
    }, 2000);
  }

  function broadcastTyping(typing) {
    if (chatMode === 'dm') {
      if (connection && sharedKey) connection.send({ type: 'typing', typing });
    } else if (chatMode === 'group') {
      for (const [, conn] of groupConnections) {
        if (conn.open) conn.send({ type: 'typing', typing });
      }
    } else if (chatMode === 'server') {
      if (isServerHost) {
        for (const [, c] of serverClients) {
          if (c.conn.open) {
            const myPseudo = isAnonymous ? 'Anonyme' : (identity?.pseudo || 'Pair');
            c.conn.send({ type: 'typing', typing, sender: myPseudo });
          }
        }
      } else if (serverConn && serverConn.open) {
        serverConn.send({ type: 'typing', typing });
      }
    }
  }

  function showPeerTyping(typing, name) {
    typingEl.hidden = !typing;
    if (typing && name) {
      const textEl = typingEl.querySelector('span:last-child');
      if (textEl) textEl.textContent = escapeHTML(name) + ' écrit...';
    } else {
      const textEl = typingEl.querySelector('span:last-child');
      if (textEl) textEl.textContent = 'en train d\'écrire...';
    }
    if (typing) messagesEl.scrollTop = messagesEl.scrollHeight;
  }


  function toast(message, type = 'info') {
    const icons = { success: '✓', error: '✗', info: 'ℹ' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHTML(message)}</span>`;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }




  setupConfirmBtn.addEventListener('click', () => createIdentity(setupPseudoInput.value));
  setupPseudoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); createIdentity(setupPseudoInput.value); }
  });


  myPseudoEl.addEventListener('click', () => {
    if (isAnonymous) { toast('Désactivez le mode anonyme d\'abord.', 'info'); return; }
    pseudoInput.value = identity?.pseudo || '';
    pseudoModal.hidden = false;
    pseudoInput.focus();
  });
  pseudoSaveBtn.addEventListener('click', () => {
    const newPseudo = pseudoInput.value.trim().slice(0, 32);
    if (newPseudo && identity) {
      identity.pseudo = newPseudo;
      saveIdentity(identity);
      updateIdentityUI();
      toast('Pseudonyme mis à jour.', 'success');
    }
    pseudoModal.hidden = true;
  });
  pseudoCancelBtn.addEventListener('click', () => { pseudoModal.hidden = true; });


  anonToggle.addEventListener('change', toggleAnonymousMode);


  copyIdBtn.addEventListener('click', async () => {
    const id = myIdEl.textContent;
    if (!id || id === 'Chargement...') return;
    try { await navigator.clipboard.writeText(id); toast('Identifiant copié !', 'success'); }
    catch { toast('Impossible de copier.', 'error'); }
  });


  refreshIdBtn.addEventListener('click', () => {
    if (connection || chatMode !== 'dm') { toast('Déconnectez-vous d\'abord.', 'info'); return; }
    if (peer) peer.destroy();
    if (!isAnonymous && identity) {
      identity.id = generatePeerId();
      saveIdentity(identity);
      updateIdentityUI();
    }
    myIdEl.textContent = 'Chargement...';
    setLandingStatus('', 'Initialisation...');
    initPeer();
    toast('Nouvel identifiant généré.', 'success');
  });


  connectBtn.addEventListener('click', () => connectToPeer());
  peerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); connectToPeer(); }
  });


  disconnectBtn.addEventListener('click', disconnectPeer);


  chatForm.addEventListener('submit', (e) => { e.preventDefault(); sendMessage(); });
  msgInput.addEventListener('input', handleTypingInput);


  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      initiateFileTransfer(fileInput.files[0]);
      fileInput.value = '';
    }
  });


  callBtn.addEventListener('click', startCall);
  callHangupBtn.addEventListener('click', () => { endCall(); addSystemMessage('Appel terminé.'); });
  muteBtn.addEventListener('click', toggleMute);


  screenshareBtn.addEventListener('click', startScreenShare);
  screenStopBtn.addEventListener('click', () => { endScreenShare(); addSystemMessage('Partage d\'écran arrêté.'); });
  screenCloseBtn.addEventListener('click', closeScreenViewer);


  addContactBtn.addEventListener('click', sendContactRequest);


  contactAcceptBtn.addEventListener('click', acceptContactRequest);
  contactRejectBtn.addEventListener('click', rejectContactRequest);


  incomingAcceptBtn.addEventListener('click', () => {
    if (pendingIncomingCall) {
      answerCall(pendingIncomingCall);
      pendingIncomingCall = null;
    } else if (pendingIncomingScreen) {
      answerScreenShare(pendingIncomingScreen);
      pendingIncomingScreen = null;
    }
    hideIncomingModal();
  });
  incomingRejectBtn.addEventListener('click', () => {
    if (pendingIncomingCall) { pendingIncomingCall.close(); pendingIncomingCall = null; }
    if (pendingIncomingScreen) { pendingIncomingScreen.close(); pendingIncomingScreen = null; }
    hideIncomingModal();
  });


  membersBtn.addEventListener('click', () => {
    membersDrawer.hidden = !membersDrawer.hidden;
    if (!membersDrawer.hidden) renderMembers();
  });
  membersCloseBtn.addEventListener('click', () => { membersDrawer.hidden = true; });


  openGroupModalBtn.addEventListener('click', () => {
    groupNameInput.value = '';
    groupModal.hidden = false;
    groupNameInput.focus();
  });
  groupCancelBtn.addEventListener('click', () => { groupModal.hidden = true; });
  groupCreateBtn.addEventListener('click', () => {
    const name = groupNameInput.value.trim().slice(0, 48);
    if (!name) { toast('Entrez un nom de groupe.', 'error'); return; }
    if (!peer || peer.destroyed) { toast('P2P non initialisé.', 'error'); return; }
    groupModal.hidden = true;
    createGroup(name);
  });
  groupNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); groupCreateBtn.click(); }
  });
  groupJoinBtn.addEventListener('click', () => {
    joinGroup(groupJoinInput.value);
    groupJoinInput.value = '';
  });
  groupJoinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); groupJoinBtn.click(); }
  });


  openServerModalBtn.addEventListener('click', () => {
    serverNameInput.value = '';
    serverModal.hidden = false;
    serverNameInput.focus();
  });
  serverCancelBtn.addEventListener('click', () => { serverModal.hidden = true; });
  serverCreateBtn.addEventListener('click', () => {
    const name = serverNameInput.value.trim().slice(0, 48);
    if (!name) { toast('Entrez un nom de serveur.', 'error'); return; }
    if (!peer || peer.destroyed) { toast('P2P non initialisé.', 'error'); return; }
    serverModal.hidden = true;
    createServer(name);
  });
  serverNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); serverCreateBtn.click(); }
  });
  serverJoinBtn.addEventListener('click', () => {
    joinServer(serverJoinInput.value);
    serverJoinInput.value = '';
  });
  serverJoinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); serverJoinBtn.click(); }
  });


  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!profilePopup.hidden) { hideProfilePopup(); return; }
      if (!profileEditModal.hidden) { closeProfileEdit(); return; }
      if (!screenOverlay.hidden) { closeScreenViewer(); return; }
      if (!incomingModal.hidden) { hideIncomingModal(); return; }
      if (!contactModal.hidden) { contactModal.hidden = true; return; }
      if (!pseudoModal.hidden) { pseudoModal.hidden = true; return; }
      if (!groupModal.hidden) { groupModal.hidden = true; return; }
      if (!serverModal.hidden) { serverModal.hidden = true; return; }
      if (!chatSection.hidden) { disconnectPeer(); return; }
    }
  });



  function addReactionToMsg(msgId, emoji, who) {
    const el = messagesEl.querySelector('[data-msg-id="' + msgId + '"]');
    if (!el) return;
    let container = el.querySelector('.pc-msg-reactions');
    if (!container) { container = document.createElement('div'); container.className = 'pc-msg-reactions'; (el.querySelector('.pc-msg-body') || el).appendChild(container); }

    let badge = container.querySelector('[data-emoji="' + emoji + '"]');
    if (badge) {
      let count = parseInt(badge.dataset.count || '1') + 1;
      badge.dataset.count = count;
      badge.querySelector('.pc-react-count').textContent = count;
      badge.title += ', ' + who;
    } else {
      badge = document.createElement('button');
      badge.className = 'pc-react-badge';
      badge.dataset.emoji = emoji;
      badge.dataset.count = '1';
      badge.title = who;
      badge.innerHTML = '<span class="pc-react-emoji">' + emoji + '</span><span class="pc-react-count">1</span>';
      badge.onclick = () => sendReaction(msgId, emoji);
      container.appendChild(badge);
    }
  }

  async function sendReaction(msgId, emoji) {
    if (chatMode === 'dm' && connection && sharedKey) {
      const payload = await encryptMessage(JSON.stringify({ action: 'react', msgId, emoji }));
      if (payload) connection.send({ type: 'msg-action', payload, timestamp: Date.now() });
    }
    addReactionToMsg(msgId, emoji, identity?.pseudo || 'Moi');
  }

  async function sendDeleteAction(msgId) {
    if (chatMode === 'dm' && connection && sharedKey) {
      const payload = await encryptMessage(JSON.stringify({ action: 'delete', msgId }));
      if (payload) connection.send({ type: 'msg-action', payload, timestamp: Date.now() });
    }
    const el = messagesEl.querySelector('[data-msg-id="' + msgId + '"]');
    if (el) {
      const textEl = el.querySelector('.pc-msg-text');
      if (textEl) { textEl.textContent = 'Message supprimé'; textEl.classList.add('pc-msg-deleted-text'); }
      el.classList.add('pc-msg-deleted');
    }
  }

  function startReply(msgId) {
    const el = messagesEl.querySelector('[data-msg-id="' + msgId + '"]');
    if (!el) return;
    const author = el.dataset.sender === 'me' ? (identity?.pseudo || 'Moi') : (peerIdentity?.pseudo || 'Pair');
    const raw = el.dataset.rawText || '';
    replyingTo = { id: msgId, author, text: raw };
    if (replyBarEl) {
      replyBarEl.hidden = false;
      if (replyBarText) replyBarText.textContent = 'Répondre à ' + author + ' — ' + raw.slice(0, 60);
    }
    msgInput.focus();
  }

  function startEdit(msgId) {
    const el = messagesEl.querySelector('[data-msg-id="' + msgId + '"]');
    if (!el || el.dataset.sender !== 'me') return;
    editingMsgId = msgId;
    msgInput.dataset.origPlaceholder = msgInput.placeholder;
    msgInput.value = el.dataset.rawText || '';
    msgInput.placeholder = 'Modifier le message — Échap pour annuler';
    msgInput.classList.add('pc-editing');
    msgInput.focus();
  }

  function cancelEdit() {
    if (!editingMsgId) return;
    editingMsgId = null;
    msgInput.value = '';
    msgInput.placeholder = msgInput.dataset.origPlaceholder || 'Envoyer un message';
    msgInput.classList.remove('pc-editing');
  }


  let emojiTarget = null;

  function showEmojiPicker(target, anchorEl) {
    if (!emojiPickerEl) return;
    emojiTarget = target;
    emojiPickerEl.hidden = false;

    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      emojiPickerEl.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
      emojiPickerEl.style.right = (window.innerWidth - rect.right) + 'px';
      emojiPickerEl.style.left = '';
      emojiPickerEl.style.top = '';
    }
  }

  function hideEmojiPicker() {
    if (emojiPickerEl) emojiPickerEl.hidden = true;
    emojiTarget = null;
  }

  function handleEmojiSelect(emoji) {
    if (emojiTarget === 'input') {
      msgInput.value += emoji;
      msgInput.focus();
    } else if (emojiTarget) {

      sendReaction(emojiTarget, emoji);
    }
    hideEmojiPicker();
  }


  function openSettings() {
    if (!settingsModal) return;
    settings = loadSettings();

    const soundsCb = $('pc-set-sounds');
    const notifCb = $('pc-set-notif');
    const localCb = $('pc-set-local-storage');
    const anonCb = $('pc-set-anon');
    const shareStatusCb = $('pc-set-share-status');
    const fontSizeSel = $('pc-set-font-size');
    if (soundsCb) soundsCb.checked = settings.sounds;
    if (notifCb) notifCb.checked = settings.desktopNotif;
    if (localCb) localCb.checked = !!settings.localStorageEnabled;
    if (anonCb) anonCb.checked = !!anonToggle?.checked;
    if (shareStatusCb) shareStatusCb.checked = settings.shareStatus !== false;
    if (fontSizeSel) fontSizeSel.value = String(settings.fontSize || 15);


    const cardName = $('pc-set-card-name');
    const cardAvatar = $('pc-set-card-avatar');
    const cardAvatarImg = $('pc-set-card-avatar-img');
    const displayName = $('pc-set-display-name');
    const peerId = $('pc-set-peer-id');
    if (cardName) cardName.textContent = identity?.pseudo || 'Anonyme';
    if (displayName) displayName.textContent = identity?.pseudo || 'Anonyme';
    if (peerId) peerId.textContent = (peer && peer.id) || '—';
    if (cardAvatar && identity?.pseudo) cardAvatar.textContent = identity.pseudo.charAt(0).toUpperCase();
    if (cardAvatarImg && identity?.avatar) { cardAvatarImg.src = identity.avatar; cardAvatarImg.hidden = false; }
    else if (cardAvatarImg) cardAvatarImg.hidden = true;


    settingsModal.querySelectorAll('.pc-theme-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === (settings.theme || 'dark'));
    });


    if (statusSelector) {
      statusSelector.querySelectorAll('[data-status]').forEach(b => b.classList.toggle('active', b.dataset.status === userStatus));
    }


    switchSettingsSection('account');
    settingsModal.classList.add('open');
  }

  function closeSettings() {
    if (settingsModal) settingsModal.classList.remove('open');
  }

  function switchSettingsSection(name) {
    if (!settingsModal) return;
    settingsModal.querySelectorAll('.pc-settings-nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === name));
    settingsModal.querySelectorAll('.pc-settings-section').forEach(s => s.classList.toggle('active', s.dataset.section === name));
  }

  function applySetting(key, value) {
    settings[key] = value;
    saveSettings(settings);

    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('theme', value);
    }
    if (key === 'fontSize') {
      messagesEl.style.fontSize = value + 'px';
    }
    if (key === 'desktopNotif' && value && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (key === 'localStorageEnabled') {

      if (chatMode === 'dm' && connection && connection.open) {
        connection.send({ type: 'local-storage-pref', enabled: value });
      }
    }
  }


  let transferPeer = null;
  let transferConn = null;
  let transferTimerId = null;

  function generateTransferKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = '';
    const arr = crypto.getRandomValues(new Uint8Array(6));
    for (let i = 0; i < 6; i++) key += chars[arr[i] % chars.length];
    return key;
  }

  function getTransferableData() {
    const data = {};
    const keys = Object.keys(localStorage).filter(k => k.startsWith('peercom'));
    keys.forEach(k => { data[k] = localStorage.getItem(k); });

    const hs = localStorage.getItem('vs-hypesquad-house');
    if (hs) data['vs-hypesquad-house'] = hs;
    return data;
  }

  function applyTransferData(data) {
    for (const [k, v] of Object.entries(data)) {
      if (typeof k === 'string' && (k.startsWith('peercom') || k === 'vs-hypesquad-house')) {
        localStorage.setItem(k, v);
      }
    }
  }

  function cleanupTransfer() {
    if (transferTimerId) { clearInterval(transferTimerId); transferTimerId = null; }
    if (transferConn) { try { transferConn.close(); } catch {} transferConn = null; }
    if (transferPeer) { try { transferPeer.destroy(); } catch {} transferPeer = null; }
  }

  function startTransferSend() {
    cleanupTransfer();
    const key = generateTransferKey();
    const transferId = 'pc-xfer-' + key.toLowerCase();

    const keyDisplay = $('pc-transfer-key');
    const keyCode = $('pc-transfer-key-code');
    const sendStatus = $('pc-transfer-send-status');
    const genBtn = $('pc-transfer-generate');
    const resultEl = $('pc-transfer-result');

    if (keyCode) keyCode.textContent = key;
    if (keyDisplay) keyDisplay.hidden = false;
    if (genBtn) genBtn.disabled = true;
    if (resultEl) resultEl.hidden = true;


    let remaining = 120;
    const timerEl = $('pc-transfer-key-timer');
    if (timerEl) timerEl.textContent = remaining;
    transferTimerId = setInterval(() => {
      remaining--;
      if (timerEl) timerEl.textContent = remaining;
      if (remaining <= 0) {
        cleanupTransfer();
        if (keyDisplay) keyDisplay.hidden = true;
        if (sendStatus) sendStatus.hidden = true;
        if (genBtn) genBtn.disabled = false;
        toast('Clé de transfert expirée.', 'info');
      }
    }, 1000);


    transferPeer = new Peer(transferId, {
      host: location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? '127.0.0.1' : 'peer.ventistudio.eu',
      port: location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? 9000 : 443,
      path: '/peercom',
      key: 'peerjs',
      secure: location.hostname !== '127.0.0.1' && location.hostname !== 'localhost'
    });

    transferPeer.on('open', () => {
      if (sendStatus) { sendStatus.hidden = false; sendStatus.querySelector('span').textContent = 'En attente de l\'autre appareil...'; }
    });

    transferPeer.on('error', (err) => {
      console.warn('Transfer peer error:', err);
      cleanupTransfer();
      if (keyDisplay) keyDisplay.hidden = true;
      if (sendStatus) sendStatus.hidden = true;
      if (genBtn) genBtn.disabled = false;
      toast('Erreur de transfert : ' + (err.message || err.type), 'error');
    });

    transferPeer.on('connection', (conn) => {
      transferConn = conn;
      if (sendStatus) sendStatus.querySelector('span').textContent = 'Appareil connecté, transfert en cours...';

      conn.on('open', () => {

        const payload = {
          type: 'device-transfer',
          data: getTransferableData(),
          pseudo: identity?.pseudo || 'Anonyme',
          timestamp: Date.now()
        };
        conn.send(payload);


        conn.on('data', (resp) => {
          if (resp && resp.type === 'transfer-ack') {
            if (sendStatus) sendStatus.hidden = true;
            if (resultEl) { resultEl.hidden = false; resultEl.querySelector('span').textContent = 'Transfert envoyé avec succès !'; }
            if (genBtn) genBtn.disabled = false;
            if (keyDisplay) keyDisplay.hidden = true;
            cleanupTransfer();
            toast('Données transférées vers l\'autre appareil !', 'success');
          }
        });
      });

      conn.on('error', () => {
        toast('Erreur de connexion pendant le transfert.', 'error');
        cleanupTransfer();
        if (sendStatus) sendStatus.hidden = true;
        if (genBtn) genBtn.disabled = false;
      });
    });
  }

  function startTransferReceive() {
    const inputEl = $('pc-transfer-input');
    const recvStatus = $('pc-transfer-recv-status');
    const recvBtn = $('pc-transfer-receive');
    const resultEl = $('pc-transfer-result');

    if (!inputEl) return;
    const key = inputEl.value.trim().toUpperCase().replace(/[^A-Z2-9]/g, '');
    if (key.length !== 6) { toast('Entrez une clé à 6 caractères.', 'error'); return; }

    const transferId = 'pc-xfer-' + key.toLowerCase();
    cleanupTransfer();

    if (recvBtn) recvBtn.disabled = true;
    if (recvStatus) { recvStatus.hidden = false; recvStatus.querySelector('span').textContent = 'Connexion en cours...'; }
    if (resultEl) resultEl.hidden = true;

    transferPeer = new Peer({
      host: location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? '127.0.0.1' : 'peer.ventistudio.eu',
      port: location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? 9000 : 443,
      path: '/peercom',
      key: 'peerjs',
      secure: location.hostname !== '127.0.0.1' && location.hostname !== 'localhost'
    });

    transferPeer.on('open', () => {
      if (recvStatus) recvStatus.querySelector('span').textContent = 'Connecté, demande de transfert...';
      transferConn = transferPeer.connect(transferId, { reliable: true });

      transferConn.on('open', () => {
        if (recvStatus) recvStatus.querySelector('span').textContent = 'En attente des données...';
      });

      transferConn.on('data', (payload) => {
        if (payload && payload.type === 'device-transfer' && payload.data) {
          applyTransferData(payload.data);

          transferConn.send({ type: 'transfer-ack' });
          if (recvStatus) recvStatus.hidden = true;
          if (resultEl) resultEl.hidden = false;
          if (recvBtn) recvBtn.disabled = false;
          cleanupTransfer();
          toast('Données reçues de « ' + (payload.pseudo || 'Appareil') + ' » ! Rechargement...', 'success');
          setTimeout(() => location.reload(), 2500);
        }
      });

      transferConn.on('error', () => {
        toast('Impossible de se connecter. Vérifiez la clé.', 'error');
        cleanupTransfer();
        if (recvStatus) recvStatus.hidden = true;
        if (recvBtn) recvBtn.disabled = false;
      });
    });

    transferPeer.on('error', (err) => {
      console.warn('Transfer receive error:', err);
      cleanupTransfer();
      if (recvStatus) recvStatus.hidden = true;
      if (recvBtn) recvBtn.disabled = false;
      if (err.type === 'peer-unavailable') {
        toast('Clé introuvable. Vérifiez qu\'elle est correcte et non expirée.', 'error');
      } else {
        toast('Erreur de transfert : ' + (err.message || err.type), 'error');
      }
    });
  }


  function setUserStatus(status) {
    userStatus = status;
    saveUserStatus(status);
    if (statusDotUser) {
      statusDotUser.className = 'pc-user-status-dot pc-status-' + status;
    }

    if (chatMode === 'dm' && connection && connection.open) {
      connection.send({ type: 'user-status', status });
    }
  }

  function updatePeerStatusDot(status) {
    const dot = document.querySelector('.pc-peer-status-dot');
    if (dot) dot.className = 'pc-peer-status-dot pc-status-' + (status || 'online');
  }


  messagesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.pc-msg-act-btn');
    if (!btn) return;
    const msgEl = btn.closest('.pc-msg');
    if (!msgEl) return;
    const msgId = msgEl.dataset.msgId;
    const action = btn.dataset.action;

    if (action === 'reply') startReply(msgId);
    else if (action === 'edit') startEdit(msgId);
    else if (action === 'delete') sendDeleteAction(msgId);
    else if (action === 'react') showEmojiPicker(msgId, btn);
  });


  if (replyBarClose) replyBarClose.addEventListener('click', () => {
    replyingTo = null;
    if (replyBarEl) replyBarEl.hidden = true;
  });


  const emojiBtnChat = $('pc-emoji-btn');
  if (emojiBtnChat) emojiBtnChat.addEventListener('click', () => {
    if (emojiPickerEl && !emojiPickerEl.hidden) { hideEmojiPicker(); return; }
    showEmojiPicker('input', emojiBtnChat);
  });


  if (emojiGridEl) emojiGridEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.pc-emoji-item');
    if (btn) handleEmojiSelect(btn.textContent.trim());
  });


  document.addEventListener('mousedown', (e) => {
    if (emojiPickerEl && !emojiPickerEl.hidden && !emojiPickerEl.contains(e.target) && e.target.id !== 'pc-emoji-btn' && !e.target.closest('.pc-msg-act-btn[data-action="react"]')) {
      hideEmojiPicker();
    }
  });


  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editingMsgId) { e.stopPropagation(); cancelEdit(); }
  });


  const settingsBtn = $('pc-settings-btn');
  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);


  const settingsCloseBtn = $('pc-settings-close');
  if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);


  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      const navBtn = e.target.closest('.pc-settings-nav-item');
      if (navBtn && navBtn.dataset.section) {
        if (navBtn.dataset.section === 'logout') {

          if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            closeSettings();
            if (peer) peer.destroy();
            toast('Déconnecté.', 'info');
          }
          return;
        }
        switchSettingsSection(navBtn.dataset.section);
      }
    });


    settingsModal.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'pc-set-sounds') applySetting('sounds', t.checked);
      else if (t.id === 'pc-set-notif') applySetting('desktopNotif', t.checked);
      else if (t.id === 'pc-set-local-storage') applySetting('localStorageEnabled', t.checked);
      else if (t.id === 'pc-set-anon') { if (anonToggle) anonToggle.checked = t.checked; anonToggle?.dispatchEvent(new Event('change')); }
      else if (t.id === 'pc-set-share-status') applySetting('shareStatus', t.checked);
      else if (t.id === 'pc-set-font-size') applySetting('fontSize', parseInt(t.value, 10));
    });


    settingsModal.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('.pc-theme-btn');
      if (themeBtn && themeBtn.dataset.theme) {
        settingsModal.querySelectorAll('.pc-theme-btn').forEach(b => b.classList.toggle('active', b === themeBtn));
        applySetting('theme', themeBtn.dataset.theme);
      }
    });


    const setEditProfile = $('pc-set-edit-profile');
    if (setEditProfile) setEditProfile.addEventListener('click', () => { closeSettings(); if (profileEditModal) profileEditModal.hidden = false; });
    const setEditPseudo = $('pc-set-edit-pseudo');
    if (setEditPseudo) setEditPseudo.addEventListener('click', () => { closeSettings(); const m = $('pc-pseudo-modal'); if (m) m.hidden = false; });
    const setCopyId = $('pc-set-copy-id');
    if (setCopyId) setCopyId.addEventListener('click', () => { if (peer && peer.id) { navigator.clipboard.writeText(peer.id); toast('ID copié !', 'success'); } });


    const setClearData = $('pc-set-clear-data');
    if (setClearData) setClearData.addEventListener('click', () => {
      if (confirm('Cela supprimera tous vos messages, contacts et paramètres stockés localement. Continuer ?')) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('peercom'));
        keys.forEach(k => localStorage.removeItem(k));
        closeSettings();
        toast('Données locales effacées. Rechargement...', 'info');
        setTimeout(() => location.reload(), 1200);
      }
    });


    const setLogout = $('pc-set-logout');
    if (setLogout) setLogout.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        closeSettings();
        if (peer) peer.destroy();
        toast('Déconnecté.', 'info');
      }
    });


    const transferGenBtn = $('pc-transfer-generate');
    if (transferGenBtn) transferGenBtn.addEventListener('click', startTransferSend);
    const transferRecvBtn = $('pc-transfer-receive');
    if (transferRecvBtn) transferRecvBtn.addEventListener('click', startTransferReceive);


    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && settingsModal && settingsModal.classList.contains('open')) {
        e.stopPropagation();
        closeSettings();
      }
    });
  }


  if (statusSelector) statusSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-status]');
    if (!btn) return;
    setUserStatus(btn.dataset.status);
    statusSelector.querySelectorAll('[data-status]').forEach(b => b.classList.toggle('active', b === btn));
  });






  function buildBadgesHTML(profileData, hsData) {
    let html = '';

    if (hsData && hsData.house && HYPESQUAD_HOUSES[hsData.house]) {
      const h = HYPESQUAD_HOUSES[hsData.house];
      const displayHouse = (hsData.house === 'erudis' && hsData.publicHouse && HYPESQUAD_HOUSES[hsData.publicHouse])
        ? HYPESQUAD_HOUSES[hsData.publicHouse] : h;
      const displayId = (hsData.house === 'erudis' && hsData.publicHouse) ? hsData.publicHouse : hsData.house;
      html += `<span class="pc-badge" data-type="${displayId}" title="HypeSquad ${displayHouse.name}"><span class="pc-badge-emoji">${displayHouse.emoji}</span>${displayHouse.name}</span>`;
    }

    if (profileData.badges && Array.isArray(profileData.badges)) {
      for (const b of profileData.badges) {
        const t = (b.type || 'custom').replace(/[<>"']/g, '');
        const v = (b.label || b.value || '').replace(/[<>"']/g, '');
        const e = (b.emoji || '').replace(/[<>"']/g, '');
        html += `<span class="pc-badge" data-type="${t}" title="${v}">${e ? `<span class="pc-badge-emoji">${e}</span>` : ''}${v}</span>`;
      }
    }
    return html;
  }

  function showProfilePopup(data) {

    profileName.textContent = data.pseudo || 'Utilisateur';
    profilePseudoId.textContent = data.peerId || '';


    if (data.avatar) {
      profileAvatarImg.src = data.avatar;
      profileAvatarImg.hidden = false;
      profileAvatar.style.visibility = 'hidden';
    } else {
      profileAvatarImg.hidden = true;
      profileAvatar.style.visibility = '';
      profileAvatar.textContent = (data.pseudo || '?')[0].toUpperCase();
    }


    if (data.avatarFrame && data.avatarFrame !== 'none') {
      profileFrame.hidden = false;
      profileFrame.setAttribute('data-frame', data.avatarFrame);
    } else {
      profileFrame.hidden = true;
      profileFrame.removeAttribute('data-frame');
    }


    const hsData = data.hypesquad || (data.isSelf ? getHypesquadData() : null);
    profileBadges.innerHTML = buildBadgesHTML(data, hsData);


    profileBio.textContent = data.bio || 'Aucune bio définie.';


    if (hsData && hsData.house && HYPESQUAD_HOUSES[hsData.house]) {
      const h = HYPESQUAD_HOUSES[hsData.house];
      const displayHouse = (hsData.house === 'erudis' && hsData.publicHouse && HYPESQUAD_HOUSES[hsData.publicHouse])
        ? HYPESQUAD_HOUSES[hsData.publicHouse] : h;
      profileHsSection.hidden = false;
      profileHypesquad.innerHTML = `<span class="pc-profile-hs-emoji">${displayHouse.emoji}</span> Maison ${displayHouse.name}`;
    } else {
      profileHsSection.hidden = true;
    }


    if (data.created) {
      profileMemberSince.textContent = new Date(data.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
      profileMemberSince.textContent = '—';
    }

    profilePopup.hidden = false;
  }

  function hideProfilePopup() {
    profilePopup.hidden = true;
  }

  function showMyProfile() {
    if (!identity) return;
    const profile = loadProfile();
    const hsData = getHypesquadData();
    showProfilePopup({
      pseudo: identity.pseudo,
      peerId: identity.id,
      avatar: profile.avatar || null,
      avatarFrame: profile.avatarFrame || 'none',
      bio: profile.bio || '',
      badges: profile.badges || [],
      hypesquad: hsData,
      created: identity.created,
      isSelf: true
    });
  }

  function showPeerProfile() {
    if (!peerIdentity) return;
    showProfilePopup({
      pseudo: peerIdentity.pseudo,
      peerId: peerIdentity.peerId,
      avatar: peerIdentity.avatar || null,
      avatarFrame: peerIdentity.avatarFrame || 'none',
      bio: peerIdentity.bio || '',
      badges: peerIdentity.badges || [],
      hypesquad: peerIdentity.hypesquad || null,
      created: peerIdentity.created || null,
      isSelf: false
    });
  }


  let editAvatarData = null;
  let editFrameChoice = 'none';

  function openProfileEdit() {
    if (!identity) return;
    const profile = loadProfile();


    editAvatarData = profile.avatar || null;
    if (editAvatarData) {
      editAvatarImg.src = editAvatarData;
      editAvatarImg.hidden = false;
      editAvatar.style.visibility = 'hidden';
      editAvatarRemove.hidden = false;
    } else {
      editAvatarImg.hidden = true;
      editAvatar.style.visibility = '';
      editAvatar.textContent = identity.pseudo[0].toUpperCase();
      editAvatarRemove.hidden = true;
    }


    editBio.value = profile.bio || '';
    editBioCount.textContent = editBio.value.length;


    editFrameChoice = profile.avatarFrame || 'none';
    framePicker.querySelectorAll('.pc-frame-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.frame === editFrameChoice);
    });

    profileEditModal.hidden = false;
  }

  function closeProfileEdit() {
    profileEditModal.hidden = true;
    editAvatarFile.value = '';
  }

  function saveProfileEdit() {
    const profile = loadProfile();
    profile.avatar = editAvatarData;
    profile.avatarFrame = editFrameChoice;
    profile.bio = editBio.value.trim().slice(0, 190);
    saveProfile(profile);
    updateIdentityUI();
    closeProfileEdit();
    toast('Profil mis à jour !', 'success');
  }


  function updateAvatarUI() {
    const profile = loadProfile();
    if (profile.avatar) {
      myAvatarImg.src = profile.avatar;
      myAvatarImg.hidden = false;
    } else {
      myAvatarImg.hidden = true;
    }
  }


  function buildIdentityPayload() {
    if (isAnonymous || !identity) return null;
    const profile = loadProfile();
    const hsData = getHypesquadData();
    const payload = { type: 'identity', pseudo: identity.pseudo, peerId: identity.id };
    if (profile.avatar) payload.avatar = profile.avatar;
    if (profile.avatarFrame && profile.avatarFrame !== 'none') payload.avatarFrame = profile.avatarFrame;
    if (profile.bio) payload.bio = profile.bio;
    if (profile.badges && profile.badges.length) payload.badges = profile.badges;
    if (hsData && hsData.house) {
      payload.hypesquad = { house: hsData.house };
      if (hsData.publicHouse) payload.hypesquad.publicHouse = hsData.publicHouse;
    }
    if (identity.created) payload.created = identity.created;
    return payload;
  }


  if (profileCloseBtn) profileCloseBtn.addEventListener('click', hideProfilePopup);
  if (upLeft) upLeft.addEventListener('click', showMyProfile);
  if (editProfileBtn) editProfileBtn.addEventListener('click', openProfileEdit);
  if (profileEditCancel) profileEditCancel.addEventListener('click', closeProfileEdit);
  if (profileEditSave) profileEditSave.addEventListener('click', saveProfileEdit);

  if (editAvatarBtn) editAvatarBtn.addEventListener('click', () => editAvatarFile.click());
  if (editAvatarFile) editAvatarFile.addEventListener('change', async () => {
    const file = editAvatarFile.files[0];
    if (!file) return;
    try {
      editAvatarData = await resizeImage(file, 256, 256, MAX_AVATAR_SIZE);
      editAvatarImg.src = editAvatarData;
      editAvatarImg.hidden = false;
      editAvatar.style.visibility = 'hidden';
      editAvatarRemove.hidden = false;
    } catch (e) {
      toast(e.message || 'Erreur lors du chargement de l\'avatar.', 'error');
    }
    editAvatarFile.value = '';
  });

  if (editAvatarRemove) editAvatarRemove.addEventListener('click', () => {
    editAvatarData = null;
    editAvatarImg.hidden = true;
    editAvatar.style.visibility = '';
    editAvatar.textContent = identity ? identity.pseudo[0].toUpperCase() : '?';
    editAvatarRemove.hidden = true;
  });

  if (editBio) editBio.addEventListener('input', () => {
    editBioCount.textContent = editBio.value.length;
  });

  if (framePicker) framePicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.pc-frame-option');
    if (!btn) return;
    editFrameChoice = btn.dataset.frame;
    framePicker.querySelectorAll('.pc-frame-option').forEach(b => b.classList.toggle('active', b === btn));
  });


  const peerAvatarEl = $('pc-peer-avatar');
  if (peerAvatarEl) peerAvatarEl.addEventListener('click', showPeerProfile);


  const mobileToggle = $('pc-mobile-toggle');
  const sidebarBackdrop = $('pc-sidebar-backdrop');
  const sidebar = $('pc-sidebar');

  function openSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('active');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('active');
  }

  if (mobileToggle) mobileToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);


  const dmListEl = document.getElementById('pc-dm-list');
  if (dmListEl) dmListEl.addEventListener('click', (e) => {
    if (e.target.closest('.pc-dm-item') && window.innerWidth <= 768) {
      closeSidebar();
    }
  });


  settings = loadSettings();
  userStatus = loadUserStatus();
  if (statusDotUser) statusDotUser.className = 'pc-user-status-dot pc-status-' + userStatus;
  if (statusSelector) {
    statusSelector.querySelectorAll('[data-status]').forEach(b => b.classList.toggle('active', b.dataset.status === userStatus));
  }

  if (settings.fontSize && settings.fontSize !== 15) {
    messagesEl.style.fontSize = settings.fontSize + 'px';
  }

  if (emojiGridEl) {
    emojiGridEl.innerHTML = COMMON_EMOJIS.map(e => '<button class="pc-emoji-item" type="button">' + e + '</button>').join('');
  }

  if (settings.desktopNotif && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  initIdentity();
  if (identity) {
    setTimeout(initPeer, 300);
  }
});
