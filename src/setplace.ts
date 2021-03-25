import { Message, MessageEmbed } from "discord.js";
import { sheets_v4 } from "googleapis";
import { SPREADSHEETID } from "./config";
import { ErrorMessage } from "./util";

export async function setPlace(message: Message, sheets: sheets_v4.Sheets,
  num: number, place: string, mode: number): Promise<void> {
  try {
    if (mode === 1 || mode === 3) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEETID,
        range: `학생 신청!C${num}`,
        valueInputOption: 'RAW',
        requestBody: {
          range: `학생 신청!C${num}`,
          majorDimension: 'ROWS',
          values: [
            [place]
          ]
        }
      })
    }

    if(mode == 2 || mode == 3) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEETID,
        range: `학생 신청!F${num}`,
        valueInputOption: 'RAW',
        requestBody: {
          range: `학생 신청!F${num}`,
          majorDimension: 'ROWS',
          values: [
            [place]
          ]
        }
      })
    }

    await message.channel.send(new MessageEmbed({
      color: 0x00ff00,
      description: '이석 신청에 성공하였습니다.'
    }))
  } catch (e) {
    message.channel.send(
      ErrorMessage()
    )
  }
}