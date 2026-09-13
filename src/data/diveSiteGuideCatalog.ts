// ============================================================
// Dive Site Guide Catalog
//
// 外部潛點介紹 / 海圖連結。
// 不下載、不內嵌、不重製來源網站海圖。
//
// Source:
// Best Dive Sites Studio / 最佳潛點工作室
// ============================================================

export type DiveSiteGuide = {
  id: string
  code: string
  name: string
  regionId: string
  guideUrl: string
}


export type DiveSiteGuideRegionSource = {
  regionId: string
  regionName: string
  guideTitle: string
  sourceUrl: string
}


export const DIVE_SITE_GUIDE_SOURCE_NAME =
  '最佳潛點工作室'


export const DIVE_SITE_GUIDE_REGION_SOURCES:
  DiveSiteGuideRegionSource[] =
[
  {
    regionId: 'northeast',
    regionName: '東北角',
    guideTitle: '東北角潛點海圖',
    sourceUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9',
  },

  {
    regionId: 'kenting',
    regionName: '墾丁',
    guideTitle: '墾丁潛點海圖',
    sourceUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao',
  },

  {
    regionId: 'green-island',
    regionName: '綠島',
    guideTitle: '綠島潛點海圖',
    sourceUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao',
  },

  {
    regionId: 'lanyu',
    regionName: '蘭嶼',
    guideTitle: '蘭嶼潛點海圖',
    sourceUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao',
  },

  {
    regionId: 'liuqiu',
    regionName: '小琉球',
    guideTitle: '小琉球潛點海圖',
    sourceUrl:
      'https://sites.google.com/site/ken20060806/about/%E5%B0%8F%E7%90%89%E7%90%83%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9',
  },

  {
    regionId: 'penghu',
    regionName: '澎湖',
    guideTitle: '澎湖潛點海圖',
    sourceUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao',
  },

  {
    regionId: 'taitung',
    regionName: '台東／東部海岸',
    guideTitle: '東部海岸潛點海圖',
    sourceUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E9%83%A8%E6%B5%B7%E5%B2%B8%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9',
  }
]


export const DIVE_SITE_GUIDES:
  DiveSiteGuide[] =
[
  {
    id: 'northeast-3d01',
    code: '3D01',
    name: '秘密花園',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d01-%E7%A7%98%E5%AF%86%E8%8A%B1%E5%9C%92',
  },

  {
    id: 'northeast-3d02',
    code: '3D02',
    name: '番仔澳',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d02-%E7%95%AA%E4%BB%94%E6%BE%B3',
  },

  {
    id: 'northeast-3d03',
    code: '3D03',
    name: '母子岩825',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d03-%E6%AF%8D%E5%AD%90%E5%B2%A9825',
  },

  {
    id: 'northeast-3d04',
    code: '3D04',
    name: '釣魚台',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d04-%E9%87%A3%E9%AD%9A%E5%8F%B0',
  },

  {
    id: 'northeast-3d05',
    code: '3D05',
    name: '南雅一線天',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d05-%E5%8D%97%E9%9B%85%E4%B8%80%E7%B7%9A%E5%A4%A9',
  },

  {
    id: 'northeast-3d06',
    code: '3D06',
    name: '鼻頭角公園',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d06-%E9%BC%BB%E9%A0%AD%E8%A7%92%E5%85%AC%E5%9C%92',
  },

  {
    id: 'northeast-3d07',
    code: '3D07',
    name: '龍洞灣公園',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d07-%E9%BE%8D%E6%B4%9E%E7%81%A3%E5%85%AC%E5%9C%92',
  },

  {
    id: 'northeast-3d08',
    code: '3D08',
    name: '龍洞一號半',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d08-%E9%BE%8D%E6%B4%9E%E4%B8%80%E8%99%9F%E5%8D%8A',
  },

  {
    id: 'northeast-3d09',
    code: '3D09',
    name: '龍洞三號',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d09-%E9%BE%8D%E6%B4%9E%E4%B8%89%E8%99%9F',
  },

  {
    id: 'northeast-3d10',
    code: '3D10',
    name: '龍洞和美國小',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d10-%E9%BE%8D%E6%B4%9E%E5%92%8C%E7%BE%8E%E5%9C%8B%E5%B0%8F',
  },

  {
    id: 'northeast-3d11',
    code: '3D11',
    name: '龍洞南口公園',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d11-%E9%BE%8D%E6%B4%9E%E5%8D%97%E5%8F%A3%E5%85%AC%E5%9C%92',
  },

  {
    id: 'northeast-3d12',
    code: '3D12',
    name: '和美街',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d12-%E5%92%8C%E7%BE%8E%E8%A1%97',
  },

  {
    id: 'northeast-3d13',
    code: '3D13',
    name: '碉堡',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d13-%E7%A2%89%E5%A0%A1',
  },

  {
    id: 'northeast-3d14',
    code: '3D14',
    name: '美艷山街',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d14-%E7%BE%8E%E8%89%B7%E5%B1%B1%E8%A1%97',
  },

  {
    id: 'northeast-3d15',
    code: '3D15',
    name: '小香蘭',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d15-%E5%B0%8F%E9%A6%99%E8%98%AD',
  },

  {
    id: 'northeast-3d16',
    code: '3D16',
    name: '卯澳',
    regionId: 'northeast',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E5%8C%97%E8%A7%92%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/3d16-%E5%8D%AF%E6%BE%B3',
  },

  {
    id: 'kenting-k01',
    code: 'K01',
    name: '石珠',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%811_%E7%9F%B3%E7%8F%A0',
  },

  {
    id: 'kenting-k02',
    code: 'K02',
    name: '萬里桐-海扇區',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%812-%E8%90%AC%E9%87%8C%E6%A1%90-%E6%B5%B7%E6%89%87%E5%8D%80',
  },

  {
    id: 'kenting-k03',
    code: 'K03',
    name: '山海-赤筆仔礁',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%813-%E5%B1%B1%E6%B5%B7-%E8%B5%A4%E7%AD%86%E4%BB%94%E7%A4%81',
  },

  {
    id: 'kenting-k04',
    code: 'K04',
    name: '紅柴坑',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%814-%E7%B4%85%E6%9F%B4%E5%9D%91',
  },

  {
    id: 'kenting-k05',
    code: 'K05',
    name: '合界-沉船',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%815-%E5%90%88%E7%95%8C-%E6%B2%89%E8%88%B9',
  },

  {
    id: 'kenting-k06',
    code: 'K06',
    name: '頂白沙',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%816-%E9%A0%82%E7%99%BD%E6%B2%99',
  },

  {
    id: 'kenting-k07',
    code: 'K07',
    name: '貓鼻頭-南海洞',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%817-%E8%B2%93%E9%BC%BB%E9%A0%AD-%E5%8D%97%E6%B5%B7%E6%B4%9E',
  },

  {
    id: 'kenting-k08',
    code: 'K08',
    name: '雷打石',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%818-%E9%9B%B7%E6%89%93%E7%9F%B3',
  },

  {
    id: 'kenting-k09',
    code: 'K09',
    name: '一線天',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%819-%E4%B8%80%E7%B7%9A%E5%A4%A9',
  },

  {
    id: 'kenting-k10',
    code: 'K10',
    name: '出水口',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8110-%E5%87%BA%E6%B0%B4%E5%8F%A3',
  },

  {
    id: 'kenting-k11',
    code: 'K11',
    name: '後壁湖-軟珊瑚區',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8111-%E5%BE%8C%E5%A3%81%E6%B9%96-%E8%BB%9F%E7%8F%8A%E7%91%9A%E5%8D%80',
  },

  {
    id: 'kenting-k12',
    code: 'K12',
    name: '後壁湖-雀屏珊瑚區',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8112-%E5%BE%8C%E5%A3%81%E6%B9%96-%E9%9B%80%E5%B1%8F%E7%8F%8A%E7%91%9A%E5%8D%80',
  },

  {
    id: 'kenting-k13',
    code: 'K13',
    name: '眺石',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8113-%E7%9C%BA%E7%9F%B3',
  },

  {
    id: 'kenting-k14',
    code: 'K14',
    name: '南灣三腳町',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8114-%E5%8D%97%E7%81%A3%E4%B8%89%E8%85%B3%E7%94%BA',
  },

  {
    id: 'kenting-k15',
    code: 'K15',
    name: '獨立礁',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8115-%E7%8D%A8%E7%AB%8B%E7%A4%81',
  },

  {
    id: 'kenting-k16',
    code: 'K16',
    name: '大咾咕-斜坡',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8116-%E5%A4%A7%E5%92%BE%E5%92%95-%E6%96%9C%E5%9D%A1',
  },

  {
    id: 'kenting-k17',
    code: 'K17',
    name: '小咾咕-斷層',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8117-%E5%B0%8F%E5%92%BE%E5%92%95-%E6%96%B7%E5%B1%A4',
  },

  {
    id: 'kenting-k18',
    code: 'K18',
    name: '雙峰藍洞',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8118-%E9%9B%99%E5%B3%B0%E8%97%8D%E6%B4%9E',
  },

  {
    id: 'kenting-k19',
    code: 'K19',
    name: '香蕉灣',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8119-%E9%A6%99%E8%95%89%E7%81%A3',
  },

  {
    id: 'kenting-k20',
    code: 'K20',
    name: '沙島',
    regionId: 'kenting',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/ken-ding-qian-dian-jie-shao/%E5%A2%BE%E4%B8%8120-%E6%B2%99%E5%B3%B6',
  },

  {
    id: 'green-island-g01',
    code: 'G01',
    name: '大香菇',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B61-%E5%A4%A7%E9%A6%99%E8%8F%87',
  },

  {
    id: 'green-island-g02',
    code: 'G02',
    name: '電桿礁',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B62-%E9%9B%BB%E6%A1%BF%E7%A4%81',
  },

  {
    id: 'green-island-g03',
    code: 'G03',
    name: '六米礁',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B63-%E5%85%AD%E7%B1%B3%E7%A4%81',
  },

  {
    id: 'green-island-g04',
    code: 'G04',
    name: '龜灣鼻_白鞭林',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B64-%E9%BE%9C%E7%81%A3%E9%BC%BB_%E7%99%BD%E9%9E%AD%E6%9E%97',
  },

  {
    id: 'green-island-g05',
    code: 'G05',
    name: '雞仔礁',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B65-%E9%9B%9E%E4%BB%94%E7%A4%81',
  },

  {
    id: 'green-island-g06',
    code: 'G06',
    name: '鋼鐵礁',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B66-%E9%8B%BC%E9%90%B5%E7%A4%81',
  },

  {
    id: 'green-island-g07',
    code: 'G07',
    name: '馬蹄橋',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B67-%E9%A6%AC%E8%B9%84%E6%A9%8B',
  },

  {
    id: 'green-island-g08',
    code: 'G08',
    name: '教堂',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B68-%E6%95%99%E5%A0%82',
  },

  {
    id: 'green-island-g09',
    code: 'G09',
    name: '大白沙獨立礁',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B69-%E5%A4%A7%E7%99%BD%E6%B2%99%E7%8D%A8%E7%AB%8B%E7%A4%81',
  },

  {
    id: 'green-island-g10',
    code: 'G10',
    name: '紫坪礁',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B610-%E7%B4%AB%E5%9D%AA%E7%A4%81',
  },

  {
    id: 'green-island-g11',
    code: 'G11',
    name: '飛馬號沉船',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B611-%E9%A3%9B%E9%A6%AC%E8%99%9F%E6%B2%89%E8%88%B9',
  },

  {
    id: 'green-island-g12',
    code: 'G12',
    name: '溫泉巨塔',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B612-%E6%BA%AB%E6%B3%89%E5%B7%A8%E5%A1%94',
  },

  {
    id: 'green-island-g13',
    code: 'G13',
    name: '柚子湖',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B613-%E6%9F%9A%E5%AD%90%E6%B9%96',
  },

  {
    id: 'green-island-g14',
    code: 'G14',
    name: '楠仔湖外礁',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B614-%E6%A5%A0%E4%BB%94%E6%B9%96%E5%A4%96%E7%A4%81',
  },

  {
    id: 'green-island-g15',
    code: 'G15',
    name: '三塊石',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B615-%E4%B8%89%E5%A1%8A%E7%9F%B3',
  },

  {
    id: 'green-island-g16',
    code: 'G16',
    name: '一線天',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B616-%E4%B8%80%E7%B7%9A%E5%A4%A9',
  },

  {
    id: 'green-island-g17',
    code: 'G17',
    name: '大峽谷',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B617-%E5%A4%A7%E5%B3%BD%E8%B0%B7',
  },

  {
    id: 'green-island-g18',
    code: 'G18',
    name: '公館鼻',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B618-%E5%85%AC%E9%A4%A8%E9%BC%BB',
  },

  {
    id: 'green-island-g19',
    code: 'G19',
    name: '柴口保護區',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B619-%E6%9F%B4%E5%8F%A3%E4%BF%9D%E8%AD%B7%E5%8D%80',
  },

  {
    id: 'green-island-g20',
    code: 'G20',
    name: '中寮港',
    regionId: 'green-island',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lue-dao-qian-dian-jie-shao/%E7%B6%A0%E5%B3%B620-%E4%B8%AD%E5%AF%AE%E6%B8%AF',
  },

  {
    id: 'lanyu-l01',
    code: 'L01',
    name: '八代灣沉船',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC1-%E5%85%AB%E4%BB%A3%E7%81%A3%E6%B2%89%E8%88%B9',
  },

  {
    id: 'lanyu-l02',
    code: 'L02',
    name: '機場外礁',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC2-%E6%A9%9F%E5%A0%B4%E5%A4%96%E7%A4%81',
  },

  {
    id: 'lanyu-l03',
    code: 'L03',
    name: '椰油斷層',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC3-%E6%A4%B0%E6%B2%B9%E6%96%B7%E5%B1%A4',
  },

  {
    id: 'lanyu-l04',
    code: 'L04',
    name: '開元港園鰻區',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC4-%E9%96%8B%E5%85%83%E6%B8%AF%E5%9C%92%E9%B0%BB%E5%8D%80',
  },

  {
    id: 'lanyu-l05',
    code: 'L05',
    name: '藍洞',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC5-%E8%97%8D%E6%B4%9E',
  },

  {
    id: 'lanyu-l06',
    code: 'L06',
    name: '玉女岩',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC6-%E7%8E%89%E5%A5%B3%E5%B2%A9',
  },

  {
    id: 'lanyu-l07',
    code: 'L07',
    name: '母雞岩',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC7-%E6%AF%8D%E9%9B%9E%E5%B2%A9',
  },

  {
    id: 'lanyu-l08',
    code: 'L08',
    name: '雙獅岩(南獅)',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC8-%E9%9B%99%E7%8D%85%E5%B2%A9%E5%8D%97%E7%8D%85',
  },

  {
    id: 'lanyu-l09',
    code: 'L09',
    name: '雙獅岩(北獅)',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC9-%E9%9B%99%E7%8D%85%E5%B2%A9%E5%8C%97%E7%8D%85',
  },

  {
    id: 'lanyu-l10',
    code: 'L10',
    name: '雙獅外礁',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC10-%E9%9B%99%E7%8D%85%E5%A4%96%E7%A4%81',
  },

  {
    id: 'lanyu-l11',
    code: 'L11',
    name: '軍艦岩',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC11-%E8%BB%8D%E8%89%A6%E5%B2%A9',
  },

  {
    id: 'lanyu-l12',
    code: 'L12',
    name: '東清灣花園',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC12-%E6%9D%B1%E6%B8%85%E7%81%A3%E8%8A%B1%E5%9C%92',
  },

  {
    id: 'lanyu-l13',
    code: 'L13',
    name: '東清三塊石',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC13-%E6%9D%B1%E6%B8%85%E4%B8%89%E5%A1%8A%E7%9F%B3',
  },

  {
    id: 'lanyu-l14',
    code: 'L14',
    name: '關東石',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC14-%E9%97%9C%E6%9D%B1%E7%9F%B3',
  },

  {
    id: 'lanyu-l15',
    code: 'L15',
    name: '野銀小峽谷',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC15-%E9%87%8E%E9%8A%80%E5%B0%8F%E5%B3%BD%E8%B0%B7',
  },

  {
    id: 'lanyu-l16',
    code: 'L16',
    name: '馬鞍礁',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC16-%E9%A6%AC%E9%9E%8D%E7%A4%81',
  },

  {
    id: 'lanyu-l17',
    code: 'L17',
    name: '永興礁',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC17-%E6%B0%B8%E8%88%88%E7%A4%81',
  },

  {
    id: 'lanyu-l18',
    code: 'L18',
    name: '一線天',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC18-%E4%B8%80%E7%B7%9A%E5%A4%A9',
  },

  {
    id: 'lanyu-l19',
    code: 'L19',
    name: '四條溝',
    regionId: 'lanyu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/lan-yu-qian-dian-jie-shao/%E8%98%AD%E5%B6%BC19-%E5%9B%9B%E6%A2%9D%E6%BA%9D',
  },

  {
    id: 'liuqiu-q01',
    code: 'Q01',
    name: '大福西',
    regionId: 'liuqiu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E5%B0%8F%E7%90%89%E7%90%83%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E5%B0%8F%E7%90%89%E7%90%83%E5%A4%A7%E7%A6%8F%E8%A5%BF',
  },

  {
    id: 'liuqiu-q02',
    code: 'Q02',
    name: '龍蝦洞',
    regionId: 'liuqiu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E5%B0%8F%E7%90%89%E7%90%83%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E5%B0%8F%E7%90%89%E7%90%83%E9%BE%8D%E8%9D%A6%E6%B4%9E',
  },

  {
    id: 'liuqiu-q03',
    code: 'Q03',
    name: '杉福港',
    regionId: 'liuqiu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E5%B0%8F%E7%90%89%E7%90%83%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E5%B0%8F%E7%90%89%E7%90%83%E6%9D%89%E7%A6%8F%E6%B8%AF',
  },

  {
    id: 'liuqiu-q04',
    code: 'Q04',
    name: '破沈船',
    regionId: 'liuqiu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E5%B0%8F%E7%90%89%E7%90%83%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E5%B0%8F%E7%90%89%E7%90%83%E7%A0%B4%E6%B2%88%E8%88%B9',
  },

  {
    id: 'liuqiu-q05',
    code: 'Q05',
    name: '電桿礁',
    regionId: 'liuqiu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E5%B0%8F%E7%90%89%E7%90%83%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E5%B0%8F%E7%90%89%E7%90%83%E9%9B%BB%E6%A1%BF%E7%A4%81',
  },

  {
    id: 'liuqiu-q06',
    code: 'Q06',
    name: '花瓶岩',
    regionId: 'liuqiu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E5%B0%8F%E7%90%89%E7%90%83%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E5%B0%8F%E7%90%89%E7%90%83%E8%8A%B1%E7%93%B6%E5%B2%A9',
  },

  {
    id: 'penghu-p01',
    code: 'P01',
    name: '員貝淺礁區',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%961-%E5%93%A1%E8%B2%9D%E6%B7%BA%E7%A4%81%E5%8D%80',
  },

  {
    id: 'penghu-p02',
    code: 'P02',
    name: '姑婆嶼',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%962-%E5%A7%91%E5%A9%86%E5%B6%BC',
  },

  {
    id: 'penghu-p03',
    code: 'P03',
    name: '山水',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%963-%E5%B1%B1%E6%B0%B4',
  },

  {
    id: 'penghu-p04',
    code: 'P04',
    name: '青灣',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%964-%E9%9D%92%E7%81%A3',
  },

  {
    id: 'penghu-p05',
    code: 'P05',
    name: '風櫃內灣',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%965-%E9%A2%A8%E6%AB%83%E5%85%A7%E7%81%A3',
  },

  {
    id: 'penghu-p09',
    code: 'P09',
    name: '香爐嶼',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%969-%E9%A6%99%E7%88%90%E5%B6%BC',
  },

  {
    id: 'penghu-p10',
    code: 'P10',
    name: '𥚃正角',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%9610-%E6%AD%A3%E8%A7%92',
  },

  {
    id: 'penghu-p11',
    code: 'P11',
    name: '虎井嶼南側',
    regionId: 'penghu',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/peng-hu-qian-dian-jie-shao/%E6%BE%8E%E6%B9%9611-%E8%99%8E%E4%BA%95%E5%B6%BC%E5%8D%97%E5%81%B4',
  },

  {
    id: 'taitung-e01',
    code: 'E01',
    name: '杉原北側',
    regionId: 'taitung',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E9%83%A8%E6%B5%B7%E5%B2%B8%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E6%9D%B1%E9%83%A8-1_%E6%9D%89%E5%8E%9F%E5%8C%97%E5%81%B4',
  },

  {
    id: 'taitung-e02',
    code: 'E02',
    name: '基翬港北側',
    regionId: 'taitung',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E9%83%A8%E6%B5%B7%E5%B2%B8%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E6%9D%B1%E9%83%A8-2_%E5%9F%BA%E7%BF%AC%E6%B8%AF%E5%8C%97%E5%81%B4',
  },

  {
    id: 'taitung-e03',
    code: 'E03',
    name: '基翬港南側',
    regionId: 'taitung',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E9%83%A8%E6%B5%B7%E5%B2%B8%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E6%9D%B1%E9%83%A8-3_%E5%9F%BA%E7%BF%AC%E6%B8%AF%E5%8D%97%E5%81%B4',
  },

  {
    id: 'taitung-e04',
    code: 'E04',
    name: '新蘭港南側',
    regionId: 'taitung',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E9%83%A8%E6%B5%B7%E5%B2%B8%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E6%9D%B1%E9%83%A8-4_%E6%96%B0%E8%98%AD%E6%B8%AF%E5%8D%97%E5%81%B4',
  },

  {
    id: 'taitung-e05',
    code: 'E05',
    name: '石梯坪',
    regionId: 'taitung',
    guideUrl:
      'https://sites.google.com/site/ken20060806/about/%E6%9D%B1%E9%83%A8%E6%B5%B7%E5%B2%B8%E6%BD%9B%E9%BB%9E%E4%BB%8B%E7%B4%B9/%E6%9D%B1%E9%83%A8-5_%E7%9F%B3%E6%A2%AF%E5%9D%AA',
  }
]


export function getDiveSiteGuidesByRegion(
  regionId:
    string
) {

  return DIVE_SITE_GUIDES.filter(
    guide =>
      guide.regionId ===
      regionId
  )

}


export function getDiveSiteGuideSourceByRegion(
  regionId:
    string
) {

  return (
    DIVE_SITE_GUIDE_REGION_SOURCES.find(
      source =>
        source.regionId ===
        regionId
    ) ??
    null
  )

}
