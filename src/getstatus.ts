import { Message, MessageEmbed } from "discord.js";
import { sheets_v4 } from "googleapis";
import { SPREADSHEETID } from "./config";
import { ErrorMessage } from "./util";

export async function getStatus(message: Message, sheets: sheets_v4.Sheets, mode: number): Promise<void> {
  try {
    const rows = (await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEETID,
      range: mode===1?'안내!P3:R44':'안내!S3:U44'
    })).data.values

    const embed = new MessageEmbed().setTitle(`${mode}교시 이석신청 현황`).setColor(0xabcdef)
    rows!.forEach(row => {
      if(row[0] !== undefined && row[0] !== '') {
        embed.addField(row[0], `${row[2]} / ${row[1]}`)
      }
    });

    await message.channel.send(
      embed
    )
  } catch (e) {
    message.channel.send(
      ErrorMessage()
    )
  }
}