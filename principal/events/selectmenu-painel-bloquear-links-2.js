const { 
  Events, 
  ContainerBuilder, 
  MessageFlags, 
  StringSelectMenuBuilder 
} = require("discord.js");
const { QuickDB } = require("quick.db");

const db = new QuickDB();
const bloqueioT = db.table("tabelaBloqueiodeLinks");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isStringSelectMenu()) return;
    const customId = interaction.customId;

    // MENU PRINCIPAL
    if (customId === "menu-painel-bloquear-links") {
      const values = interaction.values[0];

      // Quando selecionar “definições”
      if (values === "definições") {
        const guildId = interaction.guild.id;

        // Busca o estado atual
        let sistemaAtivo = await bloqueioT.get(`${guildId}.ativo`);

        // Se ainda não existir no banco, define como ativo por padrão
        if (sistemaAtivo === undefined) {
          sistemaAtivo = true;
          await bloqueioT.set(`${guildId}.ativo`, true);
        }

        // Define a opção conforme o estado atual
        const menu = new StringSelectMenuBuilder()
          .setCustomId("menu-definições-opções")
          .setPlaceholder("Configure alguma definição")
          .addOptions([
            sistemaAtivo
              ? { label: "Desativar Sistema", value: "desativar-sistema", emoji: "🛑" }
              : { label: "Ativar Sistema", value: "ativar-sistema", emoji: "✅" },
              { label: "Adicionar User", value: "adicionar-user", emoji: "1429239841979371600", description: "Adicione um user na lista que pode mandar links" },
              { label: "Remover User", value: "remover-user", emoji: "1429239944987021393", description: "Remova o user da lista de quem pode mandar links" },
              { label: "Adicionar Cargo", value: "adicionar-cargo", emoji: "1429239841979371600", description: "Adicione um cargo na lista que todos no cargo podem mandar links" },
              { label: "Remover Cargo", value: "remover-cargo", emoji: "1429239944987021393", description: "Remova o cargo da lista de todos no cargo poderem enviar links" }
          ]);

        const container = new ContainerBuilder()
          .setAccentColor(0x0099ff)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              `**Definições | ${client.user.username}**\n\n` +
                `- **${sistemaAtivo ? "✅ Ativado" : "❌ Desativado"}**.\n` +
                "**╰** Sistema desenvolvido por **DevPoor**"
            )
          )
          .addActionRowComponents((row) => row.addComponents(menu));

        await interaction.reply({
          components: [container],
          flags: [MessageFlags.IsComponentsV2],
          ephemeral: true,
        });
      }
    }

    // MENU DE DEFINIÇÕES (ATIVAR/DESATIVAR)
    if (customId === "menu-definições-opções") {
      const value = interaction.values[0];
      const guildId = interaction.guild.id;

      if (value === "ativar-sistema") {
        await bloqueioT.set(`${guildId}.ativo`, true);
        await interaction.reply({
          content: "<:correto:1429222214623953047> O sistema de bloqueio de links foi **ativado**!",
          ephemeral: true,
        });
      }

      if (value === "desativar-sistema") {
        await bloqueioT.set(`${guildId}.ativo`, false);
        await interaction.reply({
          content: "<:incorreto:1429222471575273552> O sistema de bloqueio de links foi **desativado**!",
          ephemeral: true,
        });
      }
    }
  },
};