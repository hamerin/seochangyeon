import { Message, MessageEmbed } from 'discord.js'
import { promises } from 'fs'
import { google, sheets_v4 } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'

import { GOOGLE } from './config'
import { ErrorMessage } from './util'

export async function getToken(message: Message, oAuth2Client: OAuth2Client): Promise<sheets_v4.Sheets | undefined> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE.SCOPES,
  });

  await message.channel.send(new MessageEmbed({
    title: "인증",
    color: 0xabcdef,
    description: `링크를 방문해서 인증을 완료하고, 코드를 이 채널에 적어주세요.`
  }).addField(
    "주의! 인증 정보는 모든 서버에 공유됩니다.",
    authUrl
  ));

  try {
    console.log("Message Await")
    const reply = (await message.channel.awaitMessages(
      (m: Message) => m.author.id === message.author.id,
      {
        max: 1,
        time: 120000,
        errors: ['time']
      }
    )).first()
    console.log("Message Get")

    try {
      const token = (await oAuth2Client.getToken(reply!.content.trim())).tokens
      oAuth2Client.setCredentials(token)
      await promises.writeFile(GOOGLE.TOKEN_PATH, JSON.stringify(token))

      await message.channel.send(new MessageEmbed({
        title: "인증 성공",
        color: 0x00ff00,
        description: '인증 성공. 인증 정보가 저장되었습니다.'
      }))
      return google.sheets({ version: 'v4', auth: oAuth2Client })
    } catch (e) {
      await message.channel.send(
        ErrorMessage("인증에 실패하였습니다.")
      )
      return undefined
    }
  } catch (e) {
    await message.channel.send(
      ErrorMessage("응답 시간을 초과하였습니다.")
    )
    return undefined
  }
}