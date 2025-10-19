const {
  Events,
  ActionRowBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
} = require("discord.js");
const { QuickDB } = require("quick.db");

const db = new QuickDB();
const bloqueioT = db.table("tabelaBloqueiodeLinks");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isAnySelectMenu()) return;

    const guildId = interaction.guild.id;
    const value = interaction.values[0];
    const customId = interaction.customId;

    // =============================
    // ADICIONAR USER
    // =============================
    if (value === "adicionar-user") {
      const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user-add-select")
        .setPlaceholder("Selecione o usuário para adicionar")
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(userSelect);

      return interaction.reply({
        content: "👤 Selecione um usuário para adicionar à lista de permissões:",
        components: [row],
        ephemeral: true,
      });
    }

    // =============================
    // REMOVER USER
    // =============================
    if (value === "remover-user") {
      const lista = (await bloqueioT.get(`${guildId}.users`)) || [];

      if (lista.length === 0) {
        return interaction.reply({
          content: "⚠️ Nenhum usuário está autorizado a enviar links.",
          ephemeral: true,
        });
      }

      const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user-remove-select")
        .setPlaceholder("Selecione o usuário para remover")
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(userSelect);

      return interaction.reply({
        content: "🗑️ Selecione o usuário para remover da lista:",
        components: [row],
        ephemeral: true,
      });
    }

    // =============================
    // ADICIONAR CARGO
    // =============================
    if (value === "adicionar-cargo") {
      const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId("role-add-select")
        .setPlaceholder("Selecione o cargo para adicionar")
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(roleSelect);

      return interaction.reply({
        content: "👥 Selecione o cargo para adicionar à lista de permissões:",
        components: [row],
        ephemeral: true,
      });
    }

    // =============================
    // REMOVER CARGO
    // =============================
    if (value === "remover-cargo") {
      const lista = (await bloqueioT.get(`${guildId}.roles`)) || [];

      if (lista.length === 0) {
        return interaction.reply({
          content: "⚠️ Nenhum cargo está autorizado a enviar links.",
          ephemeral: true,
        });
      }

      const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId("role-remove-select")
        .setPlaceholder("Selecione o cargo para remover")
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(roleSelect);

      return interaction.reply({
        content: "🗑️ Selecione o cargo para remover da lista:",
        components: [row],
        ephemeral: true,
      });
    }

    // =============================
    // PROCESSAMENTO FINAL
    // =============================

    // Adicionar user
    if (interaction.isUserSelectMenu() && customId === "user-add-select") {
      const user = interaction.values[0];
      const lista = (await bloqueioT.get(`${guildId}.users`)) || [];

      if (lista.includes(user)) {
        return interaction.reply({
          content: "⚠️ Esse usuário já está autorizado a enviar links!",
          ephemeral: true,
        });
      }

      lista.push(user);
      await bloqueioT.set(`${guildId}.users`, lista);

      return interaction.reply({
        content: "✅ Usuário adicionado à lista de permissões!",
        ephemeral: true,
      });
    }

    // Remover user
    if (interaction.isUserSelectMenu() && customId === "user-remove-select") {
      const user = interaction.values[0];
      const lista = (await bloqueioT.get(`${guildId}.users`)) || [];

      if (!lista.includes(user)) {
        return interaction.reply({
          content: "⚠️ Esse usuário não está na lista de permissões!",
          ephemeral: true,
        });
      }

      await bloqueioT.set(
        `${guildId}.users`,
        lista.filter(id => id !== user)
      );

      return interaction.reply({
        content: "🗑️ Usuário removido da lista de permissões!",
        ephemeral: true,
      });
    }

    // Adicionar cargo
    if (interaction.isRoleSelectMenu() && customId === "role-add-select") {
      const role = interaction.values[0];
      const lista = (await bloqueioT.get(`${guildId}.roles`)) || [];

      if (lista.includes(role)) {
        return interaction.reply({
          content: "⚠️ Esse cargo já está autorizado a enviar links!",
          ephemeral: true,
        });
      }

      lista.push(role);
      await bloqueioT.set(`${guildId}.roles`, lista);

      return interaction.reply({
        content: "✅ Cargo adicionado à lista de permissões!",
        ephemeral: true,
      });
    }

    // Remover cargo
    if (interaction.isRoleSelectMenu() && customId === "role-remove-select") {
      const role = interaction.values[0];
      const lista = (await bloqueioT.get(`${guildId}.roles`)) || [];

      if (!lista.includes(role)) {
        return interaction.reply({
          content: "⚠️ Esse cargo não está na lista de permissões!",
          ephemeral: true,
        });
      }

      await bloqueioT.set(
        `${guildId}.roles`,
        lista.filter(id => id !== role)
      );

      return interaction.reply({
        content: "🗑️ Cargo removido da lista de permissões!",
        ephemeral: true,
      });
    }
  },
};
