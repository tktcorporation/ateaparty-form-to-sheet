// タイムスタンプ
// ソロ or アンサンブル
// discord 名
// vrc profile url
// 1人目: discord 名
// 1人目: vrc profile url
// 2人目: discord 名
// 2人目: vrc profile url
// さらにメンバーを登録しますか
// 3人目: discord 名
// 3人目: vrc profile url
// さらにメンバーを登録しますか
// 4人目: discord 名
// 4人目: vrc profile url
// さらにメンバーを登録しますか
// 5人目: discord 名
// 5人目: vrc profile url
// プログラム、出演者欄に表示してほしい名前
// 1人目: プログラム、出演者欄に表示してほしい名前
// 2人目: プログラム、出演者欄に表示してほしい名前
// 3人目: プログラム、出演者欄に表示してほしい名前
// 4人目: プログラム、出演者欄に表示してほしい名前
// 5人目: プログラム、出演者欄に表示してほしい名前
// 1人目: 使用楽器
// 2人目: 使用楽器
// 3人目: 使用楽器
// 4人目: 使用楽器
// 5人目: 使用楽器

const onFormSubmit = (e: GoogleAppsScript.Events.FormsOnFormSubmit) => {
  const response = e.response;
  // responseの中身を確認
  const itemResponses = response.getItemResponses();
  itemResponses.forEach(itemResponse => {
    const title = itemResponse.getItem().getTitle();
    const response = itemResponse.getResponse();
    console.log(title, response);
  });

  // { title: ['代表者', `メンバー{i+1}`], name: string, instrument: string }[] に変換
  const programNameMaps = itemResponses
    .filter(itemResponse => {
      const title = itemResponse.getItem().getTitle();
      return title.includes('プログラム、出演者欄に表示してほしい名前');
    }
    )
    .map((itemResponse, i) => {
      // 代表者 or メンバー{i+1}
      const title = i === 0 ? '代表者' : `メンバー${i}`;
      const name = itemResponse.getResponse();
      const instrument = itemResponses
        .filter(itemResponse => {
          const title = itemResponse.getItem().getTitle();
          return title.includes('使用楽器');
        })
        .map(itemResponse => itemResponse.getResponse());
      return {
        title,
        name,
        instrument
      }
    });


  // 「プログラム、出演者欄に表示してほしい名前」の先頭を使ってシートを作成
  const programName = programNameMaps[0].name;

  if (typeof programName !== 'string') {
    throw new Error(`名前が取得できませんでした: ${programName}`);
  }
  // シート名に使えない文字を削除
  const sheetName = `${programName.replace(/[:\/]/g, '')}グループ`;

  // シートを作成
  const sheetId = '1P28jil_RpfJxBs9oXGpiHspAJvGCvnT0im_uDoNC_uw'
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  // シートの存在確認
  if (!spreadsheet) {
    throw new Error('スプレッドシートが見つかりませんでした');
  }
  // すでに同じ名前のシートがある場合はなにもしない
  if (spreadsheet.getSheetByName(sheetName)) {
    console.log(`シートがすでに存在します: ${sheetName}`);
    return
  }

  const sheet = spreadsheet.insertSheet(sheetName);

  // シートの先頭に名前と楽器の入力欄を作る
  programNameMaps.forEach((programNameMap, i) => {
    sheet.getRange(1, i + 1).setValue(programNameMap.title);
    sheet.getRange(2, i + 1).setValue(programNameMap.name);

    sheet.getRange(4, i + 1).setValue(`使用楽器${i+1}`);
    sheet.getRange(5, i + 1).setValue(programNameMap.instrument);
  });

  // 次の行から、プログラムの情報を入れられるようにする
  // 曲順	曲	作曲者	演奏時間	参考URL  備考
  const programInfo = [
    '曲順', '曲', '作曲者', '演奏時間', '参考URL', '備考'
  ];
  const startRow = 8;
  programInfo.forEach((info, i) => {
    sheet.getRange(startRow, i + 1).setValue(info);
  })
  // startRow の色を変える
  sheet.getRange(startRow, 1, 1, programInfo.length).setBackground('#FFA500');
}
