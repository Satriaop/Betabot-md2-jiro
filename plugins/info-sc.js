let handler = async (m, { conn }) => {
let ye = `@${m.sender.split`@`[0]}`
let esce = `
Hai ${ye} Bot Ini Menggunakan Script :\n• https://github.com/Satriaop/Betabot-md2-jiro
`
m.reply(esce)
}
handler.help = ['sc', 'sourcecode']
handler.tags = ['info']
handler.command = /^(sc|sourcecode)$/i

module.exports = handler