const ExcelJS = require('exceljs');
//heeeming.tistory.com/entry/라이브러리-exceljs를-활용하여-JS데이터를-엑셀-파일로-추출해-보자 [박히밍 개발 블로그:티스토리]
// Excel 파일을 저장하는 함수
function saveExcel(filePath, data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // 데이터에서 헤더 생성
  console.log(typeof data);
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers); // 첫 번째 행에 헤더 추가

  // const headers = ['주문번호', '메뉴', '가격', '주문날짜'];

  // 데이터 행 추가
  data.forEach((row) => {
    const rowData = headers.map((header) => row[header]);
    worksheet.addRow(rowData);
  });

  // 엑셀 파일 저장
  workbook.xlsx
    .writeFile(filePath)
    .then(() => {
      console.log('Excel 파일이 저장되었습니다:', filePath);
    })
    .catch((error) => {
      console.error('Excel 파일 저장 중 오류 발생:', error);
    });
}

exports.save = saveExcel;
