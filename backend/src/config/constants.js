module.exports = {
  ROLES: {
    USER: 'user',
    CREATOR: 'creator',
    ADMIN: 'admin',
  },
  AUTH_METHODS: {
    LOCAL: 'local',
    GOOGLE: 'google',
    GUEST: 'guest',
  },
  AUDIO_FORMATS: ['mp3', 'aac', 'ogg', 'flac', 'wav'],
  AUDIO_QUALITY: {
    LOW: '128k',
    MEDIUM: '192k',
    HIGH: '320k',
  },
  REPEAT_MODES: {
    OFF: 'off',
    ALL: 'all',
    ONE: 'one',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  OTP_EXPIRY_MINUTES: 10,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
};
