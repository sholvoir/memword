const FRQ       = 0o0000007; //当
const BNC       = 0o0000070; //总
const COLLINS   = 0o0000700; //柯
const OXFORD    = 0o0001000; //牛
const ZHONG_KAO = 0o0002000; //中
const GAO_KAO   = 0o0004000; //高
const KAO_YAN   = 0o0010000; //研
const CET4      = 0o0020000; //四
const CET6      = 0o0040000; //六
const TOEFL     = 0o0100000; //托
const IELTS     = 0o0200000; //雅
const GRE       = 0o0400000; //宝

const tags = ['oxford', 'zhongKao', 'gaoKao', 'kaoYan',
    'cet4', 'cet6', 'toefl', 'ielts', 'gre'];

const int2Tag = (int) => ({
    frq: int & FRQ,
    bnc: (int & BNC) >> 3,
    collins: (int & COLLINS) >> 6,
    oxford: int & OXFORD,
    zhongKao: int & ZHONG_KAO,
    gaoKao: int & GAO_KAO,
    kaoYan: int & KAO_YAN,
    cet4: int & CET4,
    cet6: int & CET6,
    toefl: int & TOEFL,
    ielts: int & IELTS,
    gre: int & GRE
});

const tag2Int = (tag) => {
    let int = 0;
    tag.frq && (int += tag.frq & FRQ);
    tag.bnc && (int += (tag.bnc << 3) & BNC);
    tag.collins && (int += (tag.collins << 6) & COLLINS);
    tag.oxford && (int |= OXFORD);
    tag.zhongKao && (int |= ZHONG_KAO);
    tag.gaoKao && (int |= GAO_KAO);
    tag.kaoYan && (int |= KAO_YAN);
    tag.cet4 && (int |= CET4);
    tag.cet6 && (int |= CET6);
    tag.toefl && (int |= TOEFL);
    tag.ielts && (int |= IELTS);
    tag.gre && (int |= GRE);
    return int
};

const frq2rank = (frq) => {
    if (frq <= 0) return 0;
    if (frq <= 512) return 1;
    if (frq <= 1280) return 2;
    if (frq <= 2432) return 3;
    if (frq <= 4160) return 4;
    if (frq <= 6752) return 5;
    if (frq <= 10640) return 6;
    if (frq <= 16472) return 7;
    return 0;
};

module.exports = {
    FRQ, BNC, COLLINS,
    OXFORD, ZHONG_KAO, GAO_KAO,
    KAO_YAN, CET4, CET6,
    TOEFL, IELTS, GRE,
    int2Tag, tag2Int, tags, frq2rank
};