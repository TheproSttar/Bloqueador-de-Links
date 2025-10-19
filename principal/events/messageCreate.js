const { Events, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const bloqueioT = db.table("tabelaBloqueiodeLinks");

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const regexLink = /(https?:\/\/[^\s]+)/gi;

    // Se não for link, ignora
    if (!regexLink.test(message.content)) return;

    // Verifica se o sistema está ativo
    const sistemaAtivo = await bloqueioT.get(`${guildId}.ativo`);
    if (!sistemaAtivo) return;

    // ✅ Verifica se o usuário está autorizado
    const listaUsers = (await bloqueioT.get(`${guildId}.users`)) || [];
    const listaRoles = (await bloqueioT.get(`${guildId}.roles`)) || [];

    // Se o user está na lista de usuários permitidos, ignora
    if (listaUsers.includes(message.author.id)) return;

    // Se o user tem algum dos cargos permitidos, ignora
    const membro = message.member;
    if (membro.roles.cache.some(role => listaRoles.includes(role.id))) return;

    // Se chegou aqui, o user NÃO está liberado → aplicar o bloqueio
    const modo = await bloqueioT.get(`${guildId}.modo`);
    if (!modo) return;

    const botMember = message.guild.members.me;
    const canDelete = message.channel
      .permissionsFor(botMember)
      ?.has(PermissionsBitField.Flags.ManageMessages);

    // Tenta apagar a mensagem se tiver permissão
    if (canDelete) {
      await message.delete().catch(() => {
        console.log(`⚠️ Não consegui apagar a mensagem de ${message.author.tag}`);
      });
    } else {
      console.log(`⚠️ Sem permissão para apagar mensagens em ${message.channel.name}`);
    }

    // ====== Mensagem simples ======
    if (modo === "mensagem") {
      const texto =
        (await bloqueioT.get(`${guildId}.mensagem`)) ||
        "Ei, você não pode mandar links aqui!";
      const aviso = await message.channel.send(`> ${message.author}, ${texto}`);
      setTimeout(() => aviso.delete().catch(() => {}), 5000);
    }

    // ====== Embed ======
    if (modo === "embed") {
      const embedConfig =
        (await bloqueioT.get(`${guildId}.embed`)) || {
          title: "🚫 Proibido enviar links!",
          description: "Ei, você não pode mandar links aqui!",
          color: "#FF0000",
        };

      const embed = new EmbedBuilder()
        .setTitle(embedConfig.title)
        .setDescription(`${message.author}, ${embedConfig.description}`)
        .setColor(embedConfig.color || "#FF0000");

      const aviso = await message.channel.send({ embeds: [embed] });
      setTimeout(() => aviso.delete().catch(() => {}), 5000);
    }
  },
};
