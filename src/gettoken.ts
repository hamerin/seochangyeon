import { Message, MessageEmbed } from 'discord.js'
import { promises } from 'fs'
import { google, sheets_v4 } from 'googleapis'
import { OAuth2Client } from 'googleapis-common'

import { GOOGLE } from './config'
import { ErrorMessage, googleTokenType } from './util'

type authenticationResult = {
  sheets: sheets_v4.Sheets
  name?: string
  emailAddress?: string
}

export async function getToken(message: Message, oAuth2Client: OAuth2Client): Promise<authenticationResult | undefined> {
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
    const reply = (await message.channel.awaitMessages(
      (m: Message) => m.author.id === message.author.id,
      {
        max: 1,
        time: 120000,
        errors: ['time']
      }
    )).first()

    try {
      const token = (await oAuth2Client.getToken(reply!.content.trim())).tokens
      oAuth2Client.setCredentials(token)

      const loggedin = (await google.people(
        { version: 'v1', auth: oAuth2Client }
      ).people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses'
      })).data

      const name = loggedin.names![0].displayName!
      const emailAddress = loggedin.emailAddresses![0].value!

      await promises.writeFile(GOOGLE.TOKEN_PATH, JSON.stringify({
        installed: token,
        info: {
          name: name,
          emailAddress: emailAddress
        }
      } as googleTokenType))

      await message.channel.send(new MessageEmbed({
        title: "인증 성공",
        color: 0x00ff00,
        description: '인증 성공. 인증 정보가 저장되었습니다.'
      }))

      return {
        sheets: google.sheets({ version: 'v4', auth: oAuth2Client }),
        name: name,
        emailAddress: emailAddress
      }
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