module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "❌ Ocorreu um erro!", ephemeral: true });
      } else {
        await interaction.reply({ content: "❌ Ocorreu um erro!", ephemeral: true });
      }
    }
  },
};
