import { Message, MessageEmbed } from "discord.js";
import { sheets_v4 } from "googleapis";
import { SPREADSHEETID } from "./config";
import { ErrorMessage } from "./util";

export async function getCurrent(message: Message, sheets: sheets_v4.Sheets, num: number): Promise<void> {
  try {
    const row = (await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEETID,
      range: `학생 신청!B${num}:H${num}`
    })).data.values![0]

    const embed = new MessageEmbed().setTitle(`${row[0]}의 현재 신청`).setColor(0xabcdef)
    embed.addField('1교시', row[3])
    embed.addField('2교시', row[6])

    await message.channel.send(
      embed
    )
  } catch (e) {
    await message.channel.send(
      ErrorMessage()
    )
  }
}