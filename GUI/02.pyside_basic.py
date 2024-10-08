import sys
from PySide6.QtWidgets import QApplication, QWidget
from naver_kin_ui import Ui_Form
import requests
from bs4 import BeautifulSoup
import pandas as pd

class MainWindow(QWidget, Ui_Form):
    def __init__(self):
        super().__init__()
        self.setupUi(self)
        self.export_button.clicked.connect(self.export)
        self.save_button.clicked.connect(self.save)
        self.reset_button.clicked.connect(self.reset)
        self.exit_button.clicked.connect(self.exit)
    
    def export(self):
        input_keyword = self.keyword.text()
        input_page = int(self.page.text())
        self.result = []
        for page in range(1,input_page+1):
            self.textBrowser.append(f'키워드 {input_keyword} 현재 {page} 페이지 검색중')
            response = requests.get(f'https://kin.naver.com/search/list.naver?query={input_keyword}&page={page}')
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            items = soup.select('.basic1>li') 

            for item in items:
                question = item.select_one('._nclicks\\:kin\\.txt._searchListTitleAnchor').text
                link = item.select_one('._nclicks\\:kin\\.txt._searchListTitleAnchor').attrs['href']
                date = item.select_one('.txt_inline').text
                category = item.select_one('.txt_block>a:nth-of-type(2)').text
                answer_count = item.select_one('.txt_block>span:nth-of-type(2)').text.split()[1]
                self.textBrowser.append(question)
                QApplication.processEvents()
                self.result.append([question, link, date, category, answer_count]) 
            
    
    def save(self):
        input_keyword = self.keyword.text()
        
        #데이터 프레임
        df = pd.DataFrame(self.result, columns=['제목' ,'링크' , '내용' , '언론사' , '날짜'])
        df.to_excel(f'{input_keyword}.xlsx')
    
    def reset(self):
        self.keyword.setText('')
        self.page.setText('')
        self.textBrowser.setText('')
    
    def exit(self):
        sys.exit()
        
app = QApplication()

window = MainWindow()
window.show()

sys.exit(app.exec())