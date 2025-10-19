// events/clientReady.js
const { joinVoiceChannel } = require("@discordjs/voice");
const { Events, ActivityType } = require("discord.js");
const config = require("../config.json"); // ajuste o caminho se seu config.json estiver em outra pasta

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {
      console.log(`🚀 Bot iniciado como ${client.user.tag}`);

      // ====== Canal de voz (pegado do config.json) ======
      const canalVozId = config.canalVozId;
      if (!canalVozId) {
        console.log("⚠️ canalVozId não definido em config.json — pulando joinVoiceChannel.");
      } else {
        // buscar do cache ou via fetch
        let canal;
        try {
          canal = client.channels.cache.get(canalVozId) || (await client.channels.fetch(canalVozId));
        } catch (err) {
          canal = null;
        }

        if (!canal || canal.type !== 2 /* GuildVoice */ && canal.type !== "GUILD_VOICE" /* older enums */) {
          console.log("❌ Canal de voz não encontrado ou não é um canal de voz. Verifique o canalVozId em config.json.");
        } else {
          try {
            joinVoiceChannel({
              channelId: canal.id,
              guildId: canal.guild.id,
              adapterCreator: canal.guild.voiceAdapterCreator,
              selfDeaf: false,
            });
            console.log(`🎧 Entrei automaticamente em: ${canal.name}`);
          } catch (err) {
            console.error("❌ Erro ao entrar no canal de voz:", err);
          }
        }
      }

      // ====== Rotação de status (pegando do config.json) ======
      const statusList = Array.isArray(config.status) ? config.status : null;
      const intervalSeconds = Number(config.statusIntervalSeconds) || 15;

      if (!statusList || statusList.length === 0) {
        console.log("⚠️ Nenhum status configurado em config.json (campo 'status').");
        return;
      }

      let i = 0;
      const mudarStatus = async () => {
        try {
          const statusAtual = statusList[i];
          // Se quiser que seja streaming (bolinha roxa), usamos ActivityType.Streaming e colocamos url.
          // Se quiser outro tipo basta trocar (ex: ActivityType.Playing).
          const activity = {
            name: statusAtual,
            type: ActivityType.Streaming,
          };

          // url só é necessária/útil para Streaming; coloque qualquer URL válida (twitch/youtube) do config ou fallback
          const url = config.statusUrl || "https://twitch.tv/discord";
          if (activity.type === ActivityType.Streaming) activity.url = url;

          await client.user.setPresence({
            activities: [activity],
            status: "online",
          });
        } catch (err) {
          console.error("❌ Erro ao definir presença:", err);
        } finally {
          i = (i + 1) % statusList.length;
        }
      };

      // chama imediatamente e agenda
      await mudarStatus();
      setInterval(mudarStatus, intervalSeconds * 1000);
    } catch (err) {
      console.error("❌ Erro no evento clientReady:", err);
    }
  },
};
