const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("painel-bloquear-link")
    .setDescription("Configure o bot personalizado de bloquear links"),

    async execute(interaction) {
         const agora = new Date();
    const hora = agora.getHours();
    let saudacao;

    if (hora >= 5 && hora < 12) {
      saudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
      saudacao = "Boa tarde";
    } else {
      saudacao = "Boa noite";
    }

        const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`<:cadeado:1428931906996666439> | **${saudacao}. **`)
        .setDescription("-# Sistema de **Bot** personalizado\n\n" +
            `- Olá Senhor(a), oque deseja configurar hoje?\n` +
            `**╰** Configure minhas funções e sistema abaixo.`
        )
        .setColor("Aqua")

        const menu = new StringSelectMenuBuilder()
        .setCustomId("menu-painel-bloquear-links")
        .setPlaceholder("Configure minhas opções.")
        .setMaxValues(1)
        .setMaxValues(1)
        .setOptions([
            { label: "Configurar Mensagem", value: "mensagem-proibição", emoji: "1428933105389146193", description: "Configure a mensagem para proibir links" },
            { label: "Definições", value: "definições", emoji: "1428934603686809661", description: "Configure as definições do bot" }
        ]);

        const row = new ActionRowBuilder().addComponents(menu)

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
}