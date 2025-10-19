const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { QuickDB } = require("quick.db");

const db = new QuickDB();
const bloqueioT = db.table("tabelaBloqueiodeLinks");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // ====== MENU PRINCIPAL ======
    if (interaction.isStringSelectMenu()) {
      const { customId, values } = interaction;

      // menu principal
      if (customId === "menu-painel-bloquear-links") {
        const value = values[0];
        if (value === "mensagem-proibição") {
          const guildId = interaction.guild.id;
          let modo = await bloqueioT.get(`${guildId}.modo`);
          if (!modo) {
            modo = "mensagem";
            await bloqueioT.set(`${guildId}.modo`, "mensagem");
            await bloqueioT.set(`${guildId}.mensagem`, "Ei, você não pode mandar Links aqui!");
          }
          return gerarPainel(interaction, guildId, modo);
        }
      }

      // menu editar mensagem texto
      if (customId === "menu-editar-mensagem") {
        const value = values[0];
        if (value === "editar-mensagem") {
          const modal = new ModalBuilder()
            .setCustomId("modal-editar-mensagem")
            .setTitle("Editar Mensagem de Proibição");

          const input = new TextInputBuilder()
            .setCustomId("nova-mensagem")
            .setLabel("Nova mensagem de aviso")
            .setPlaceholder("Digite a nova mensagem aqui...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          const row = new ActionRowBuilder().addComponents(input);
          modal.addComponents(row);
          return interaction.showModal(modal);
        }
      }

      // menu editar embed
      if (customId === "menu-editar-embed") {
        const value = values[0];

        if (value === "editar-titulo") {
          const modal = new ModalBuilder()
            .setCustomId("modal-editar-titulo")
            .setTitle("Editar Título do Embed");

          const input = new TextInputBuilder()
            .setCustomId("novo-titulo")
            .setLabel("Novo título")
            .setPlaceholder("Ex: 🚫 Proibido enviar links!")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const row = new ActionRowBuilder().addComponents(input);
          modal.addComponents(row);
          return interaction.showModal(modal);
        }

        if (value === "editar-descricao") {
          const modal = new ModalBuilder()
            .setCustomId("modal-editar-descricao")
            .setTitle("Editar Descrição do Embed");

          const input = new TextInputBuilder()
            .setCustomId("nova-descricao")
            .setLabel("Nova descrição")
            .setPlaceholder("Ex: Ei, você não pode mandar Links aqui!")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

          const row = new ActionRowBuilder().addComponents(input);
          modal.addComponents(row);
          return interaction.showModal(modal);
        }

        if (value === "editar-cor") {
          const modal = new ModalBuilder()
            .setCustomId("modal-editar-cor")
            .setTitle("Editar Cor do Embed");

          const input = new TextInputBuilder()
            .setCustomId("nova-cor")
            .setLabel("Cor HEX (ex: #FF0000)")
            .setPlaceholder("Deixe vazio para usar vermelho padrão")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

          const row = new ActionRowBuilder().addComponents(input);
          modal.addComponents(row);
          return interaction.showModal(modal);
        }
      }
    }

    // ====== BOTÕES ======
    if (interaction.isButton()) {
      const guildId = interaction.guild.id;

      if (interaction.customId === "trocar-embed") {
        await bloqueioT.set(`${guildId}.modo`, "embed");
        await bloqueioT.set(`${guildId}.embed`, {
          title: "🚫 Proibido enviar links!",
          description: "Ei, você não pode mandar Links aqui!",
          color: "#FF0000",
        });
        return gerarPainel(interaction, guildId, "embed", true);
      }

      if (interaction.customId === "trocar-mensagem") {
        await bloqueioT.set(`${guildId}.modo`, "mensagem");
        await bloqueioT.set(`${guildId}.mensagem`, "Ei, você não pode mandar Links aqui!");
        return gerarPainel(interaction, guildId, "mensagem", true);
      }
    }

    // ====== MODAIS ======
    if (interaction.isModalSubmit()) {
      const guildId = interaction.guild.id;

      // Editar mensagem simples
      if (interaction.customId === "modal-editar-mensagem") {
        const novaMensagem = interaction.fields.getTextInputValue("nova-mensagem");
        await bloqueioT.set(`${guildId}.mensagem`, novaMensagem);
        return gerarPainel(interaction, guildId, "mensagem", true);
      }

      // Editar título
      if (interaction.customId === "modal-editar-titulo") {
        const novoTitulo = interaction.fields.getTextInputValue("novo-titulo");
        const embedConfig = (await bloqueioT.get(`${guildId}.embed`)) || {};
        embedConfig.title = novoTitulo;
        await bloqueioT.set(`${guildId}.embed`, embedConfig);
        return gerarPainel(interaction, guildId, "embed", true);
      }

      // Editar descrição
      if (interaction.customId === "modal-editar-descricao") {
        const novaDescricao = interaction.fields.getTextInputValue("nova-descricao");
        const embedConfig = (await bloqueioT.get(`${guildId}.embed`)) || {};
        embedConfig.description = novaDescricao;
        await bloqueioT.set(`${guildId}.embed`, embedConfig);
        return gerarPainel(interaction, guildId, "embed", true);
      }

      // Editar cor
      if (interaction.customId === "modal-editar-cor") {
        const novaCor = interaction.fields.getTextInputValue("nova-cor")?.trim();
        const embedConfig = (await bloqueioT.get(`${guildId}.embed`)) || {};

        const regexHEX = /^#([0-9A-Fa-f]{6})$/;
        if (!novaCor || !regexHEX.test(novaCor)) {
          embedConfig.color = "#FF0000"; // padrão vermelho
        } else {
          embedConfig.color = novaCor;
        }

        await bloqueioT.set(`${guildId}.embed`, embedConfig);
        return gerarPainel(interaction, guildId, "embed", true);
      }
    }
  },
};

// =====================================
// 🔧 Função pra montar o painel completo
// =====================================
async function gerarPainel(interaction, guildId, modo, update = false) {
  if (modo === "mensagem") {
    const texto = await bloqueioT.get(`${guildId}.mensagem`);

    const button = new ButtonBuilder()
      .setCustomId("trocar-embed")
      .setLabel("Trocar para Embed")
      .setStyle(ButtonStyle.Primary);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu-editar-mensagem")
      .setPlaceholder("Selecione uma ação")
      .addOptions([{ label: "Editar mensagem de texto", value: "editar-mensagem", emoji: "1428933105389146193" }]);

    const row1 = new ActionRowBuilder().addComponents(button);
    const row2 = new ActionRowBuilder().addComponents(menu);

    const content = `📩 **Mensagem atual:**\n> ${texto}`;

    if (update) {
      await interaction.update({ content, embeds: [], components: [row1, row2] });
    } else {
      await interaction.reply({ content, components: [row1, row2], ephemeral: true });
    }
  }

  if (modo === "embed") {
    const embedConfig =
      (await bloqueioT.get(`${guildId}.embed`)) || {
        title: "🚫 Proibido enviar links!",
        description: "Ei, você não pode mandar Links aqui!",
        color: "#FF0000",
      };

    const embed = new EmbedBuilder()
      .setTitle(embedConfig.title)
      .setDescription(embedConfig.description)
      .setColor(embedConfig.color);

    const button = new ButtonBuilder()
      .setCustomId("trocar-mensagem")
      .setLabel("Trocar para Mensagem")
      .setStyle(ButtonStyle.Primary);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu-editar-embed")
      .setPlaceholder("Selecione o que editar")
      .addOptions([
        { label: "Editar título", value: "editar-titulo", emoji: "1428933105389146193" },
        { label: "Editar descrição", value: "editar-descricao", emoji: "1428933105389146193" },
        { label: "Editar cor", value: "editar-cor", emoji: "1428933105389146193" },
      ]);

    const row1 = new ActionRowBuilder().addComponents(button);
    const row2 = new ActionRowBuilder().addComponents(menu);

    if (update) {
      await interaction.update({ content: "", embeds: [embed], components: [row1, row2] });
    } else {
      await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
    }
  }
}
 