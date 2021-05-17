import { Message, MessageEmbed } from "discord.js";
import { sheets_v4 } from "googleapis";
import { SPREADSHEETID } from "./config";
import { ErrorMessage } from "./util";

export async function getStatus(message: Message, sheets: sheets_v4.Sheets, mode: number): Promise<void> {
  try {
    if (mode === 1 || mode === 3) {
      const rows = (await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETID,
        range: '안내!P3:R44'
      })).data.values

      const embed = new MessageEmbed().setTitle(`1교시 이석신청 현황`).setColor(0xabcdef)
      rows!.forEach(row => {
        if (row[0] !== undefined && row[0] !== '') {
          embed.addField(row[0], `${row[2]} / ${row[1]}`)
        }
      });

      await message.channel.send(
        embed
      )
    }
    if (mode === 2 || mode === 3) {
      const rows = (await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETID,
        range: '안내!S3:U44'
      })).data.values

      const embed = new MessageEmbed().setTitle(`2교시 이석신청 현황`).setColor(0xabcdef)
      rows!.forEach(row => {
        if (row[0] !== undefined && row[0] !== '') {
          embed.addField(row[0], `${row[2]} / ${row[1]}`)
        }
      });

      await message.channel.send(
        embed
      )
    }
  } catch (e) {
    await message.channel.send(
      ErrorMessage()
    )
  }
}