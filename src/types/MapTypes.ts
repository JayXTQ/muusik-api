export type VoiceStates = Map<string, { guild_id: string; channel_id: string }>;
export type Updates = Map<
    string,
    { track: boolean; volume: boolean; queue: boolean; paused: boolean }
>;
