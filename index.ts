import { Client, MessageEmbed } from 'discord.js'
import { promises } from 'fs'
import { OAuth2Client } from 'googleapis-common'
import { google, sheets_v4 } from 'googleapis'

import { GOOGLE, DISCORD } from './src/config'
import { getToken } from './src/gettoken'
import { ErrorMessage, googleTokenType } from './src/util'
import { getStatus } from './src/getstatus'
import { codeToNum, sanitizePlace, sanitizeMode1, sanitizeMode2 } from './src/sanitize'
import { getCurrent } from './src/getcurrent'
import { setPlace } from './src/setplace'
import { getUser } from './src/getuser'

const client = new Client()
let oAuth2Client: OAuth2Client
let sheets: sheets_v4.Sheets
let credentialsvalid: boolean = true
let name: string
let emailAddress: string

client.on('ready', () => {
  console.log('ready')
})

client.on('message', async message => {
  if (message.content.startsWith('창연아 ')) {
    const content = message.content.trim().slice(4).replace('피카츄', '2608')

    if(content.startsWith('도움말')) {
      await message.channel.send(
        new MessageEmbed({
          title: '도움말',
          color: 0xabcdef
        }).addField(
          '창연아 도움말',
          '이 도움말을 보여 드려요.\n사용법: \`창연아 도움말\`'
        ).addField(
          '창연아 인증',
          '구글 계정을 통해 인증을 진행해요.\n사용법: \`창연아 인증\`'
        ).addField(
          '창연아 누구야',
          '현재 인증 정보를 표시해요.\n사용법: \`창연아 누구야\`'
        ).addField(
          '창연아 현황',
          '현재 전체 이석 신청 현황을 보여 드려요.\n사용법: \`창연아 현황 [1|2|1교시|2교시]\`'
        ).addField(
          '창연아 보기',
          '현재 특정 사람의 이석 신청 현황을 보여 드려요\n사용법: \`창연아 보기 [(학번)]\`'
        ).addField(
          '창연아 신청',
          '(항상 이석 가능한 장소로의) 이석 신청을 대신 해 드려요.\n사용법: \`창연아 신청 [(학번)] [(장소)|취소] [1|2|3|1교시|2교시|모두]\`'
        )
      )

      return
    }

    if (content.startsWith('인증')) {
      const ret = await getToken(message, oAuth2Client)
      if (ret !== undefined) {
        sheets = ret!.sheets
        name = ret!.name!
        emailAddress = ret!.emailAddress!
        credentialsvalid = true
      }

      return
    }

    if (!credentialsvalid) {
      await message.channel.send(ErrorMessage('인증이 필요합니다.'))

      return
    }

    if (content.startsWith('누구야')) {
      await getUser(message, name, emailAddress)

      return
    }

    if (content.startsWith('피카피카')) {
      try {
        await setPlace(message, sheets, codeToNum(2209)!, '2학년공강실(20명)', 3)
        await setPlace(message, sheets, codeToNum(2416)!, '2학년공강실(20명)', 3)
        await setPlace(message, sheets, codeToNum(2608)!, '2학년공강실(20명)', 3)
        await setPlace(message, sheets, codeToNum(2617)!, '2학년공강실(20명)', 3)
      } catch (e) {
        await message.channel.send(ErrorMessage('먼가 암튼 잘못됨'))
      }
    }

    if (content.startsWith('현황')) {
      try {
        if (sanitizeMode1(content.slice(3)) === undefined) throw Error;
        await getStatus(message, sheets, sanitizeMode1(content.slice(3))!)
      } catch (e) {
        await message.channel.send(ErrorMessage('사용법: \`창연아 현황 [1|2|1교시|2교시]\`'))
      }

      return
    }

    if (content.startsWith('보기')) {
      try {
        if (codeToNum(parseInt(content.slice(3))) === undefined) throw Error;
        await getCurrent(message, sheets, codeToNum(parseInt(content.slice(3)))!)
      } catch (e) {
        await message.channel.send(ErrorMessage('사용법: \`창연아 보기 [(학번)]\`'))
      }

      return
    }

    if (content.startsWith('신청')) {
      const splitted = content.slice(3).split(' ')

      try {
        if (parseInt(splitted[0]) === undefined) throw Error;
        if (sanitizePlace(splitted[1]) === undefined) throw Error;
        if (sanitizeMode2(splitted[2]) === undefined) throw Error;

        await setPlace(message, sheets,
          codeToNum(parseInt(splitted[0]))!, sanitizePlace(splitted[1])!, sanitizeMode2(splitted[2])!)
      } catch (e) {
        await message.channel.send(ErrorMessage('사용법: \`창연아 신청 [(학번)] [(장소)|취소] [1|2|3|1교시|2교시|모두|전부]\`'))
      }
    }
  }

});

(async () => {
  const credentials = JSON.parse(
    (await promises.readFile(GOOGLE.CREDENTIAL_PATH)).toString()
  )
  const { client_secret, client_id, redirect_uris } = credentials.installed
  oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  )

  client.login(
    JSON.parse(
      (await promises.readFile(DISCORD.TOKEN_PATH)).toString()
    ).installed
  )

  try {
    const data: googleTokenType = JSON.parse(
      (await promises.readFile(GOOGLE.TOKEN_PATH)).toString()
    )

    oAuth2Client.setCredentials(data.installed)
    sheets = google.sheets({ version: 'v4', auth: oAuth2Client })
    name = data.info.name!
    emailAddress = data.info.emailAddress!
  } catch (e) {
    credentialsvalid = false
  }

})();