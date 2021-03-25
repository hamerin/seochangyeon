const classsize: number[][] = [[16, 16, 16, 15, 16, 16, 16, 15],
[17, 16, 16, 17, 17, 17, 16, 16],
[15, 16, 15, 15, 15, 16, 15, 16]]

export function codeToNum(code: number): number | undefined {
  if (code.toString().length !== 4) return undefined

  const grade = parseInt(code.toString()[0]) - 1
  const cls = parseInt(code.toString()[1]) - 1
  const num = code % 100

  if (grade >= 3 || cls >= 8 || num > classsize[grade][cls]) return undefined

  const reducer = (a: number, b: number) => a + b;

  let ret = 2
  for (let g = 0; g < grade; g++)
    ret += classsize[g].reduce(reducer)
  for (let c = 0; c < cls; c++)
    ret += classsize[grade][c]
  ret += num

  return ret
}

export function sanitizePlace(place: string): string | undefined {
  return {
    '취소': '',
    '융과실': '융합과학실험실',
    '융합과학실험실': '융합과학실험실',
    '1공강': '1학년공강실(10명)',
    '1학년공강실': '1학년공강실(10명)',
    '1학년공강실(10명)': '1학년공강실(10명)',
    '2공강': '2학년공강실(20명)',
    '2학년공강실': '2학년공강실(20명)',
    '2학년공강실(20명)': '1학년공강실(20명)',
    '3공강': '3학년공강실(10명)',
    '3학년공강실': '3학년공강실(10명)',
    '3학년공강실(10명)': '3학년공강실(10명)',
    '수강6': '수학강의실6',
    '수학강의실6': '수학강의실6',
    '수강7': '수학강의실7',
    '수학강의실7': '수학강의실7',
    '기숙사': '(기숙사)',
    '(기숙사)': '(기숙사)'
  }[place]
}

export function sanitizeMode1(str: string): number | undefined {
  return {
    '1': 1,
    '1교시': 1,
    '2': 2,
    '2교시': 2
  }[str]
}

export function sanitizeMode2(str: string): number | undefined {
  return {
    '1': 1,
    '1교시': 1,
    '2': 2,
    '2교시': 2,
    '3': 3,
    '모두': 3
  }[str]
}