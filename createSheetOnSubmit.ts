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

const onFormSubmit = (e: GoogleAppsScript.Events.FormsOnFormSubmit) => {
  const response = e.response;
  // responseの中身を確認
  const itemResponses = response.getItemResponses();
  itemResponses.forEach(itemResponse => {
    const title = itemResponse.getItem().getTitle();
    const response = itemResponse.getResponse();
    console.log(title, response);
  });

  // 「プログラム、出演者欄に表示してほしい名前」をタイトルに含む質問の回答を取得
  const programNameMaps = itemResponses
    .filter(itemResponse => {
      const title = itemResponse.getItem().getTitle();
      return title.includes('プログラム、出演者欄に表示してほしい名前');
    }
    )
    .map(itemResponse => ({
      title: itemResponse.getItem().getTitle(),
      name: itemResponse.getResponse()
    }));

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

  // シートの先頭に名前を入れる
  programNameMaps.forEach((programNameMap, i) => {
    const key = i === 0 ? '代表者' : `メンバー${i}`;
    sheet.getRange(1, i + 1).setValue(key);
    sheet.getRange(2, i + 1).setValue(programNameMap.name);
  });

  // 次の行から、プログラムの情報を入れられるようにする
  // 曲順	曲	作曲者	演奏時間	参考URL  備考
  const programInfo = [
    '曲順', '曲', '作曲者', '演奏時間', '参考URL', '備考'
  ];
  const startRow = 6;
  programInfo.forEach((info, i) => {
    sheet.getRange(startRow, i + 1).setValue(info);
  })
  // startRow の色を変える
  sheet.getRange(startRow, 1, 1, programInfo.length).setBackground('#FFA500');
}
