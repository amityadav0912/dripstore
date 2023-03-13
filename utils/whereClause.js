// base - product.find();

//bigQuery - search=coder&page=2&category=shortsleeves&rating[gte]=4
//           &price[lte]=999&price[gte]=199&limit=5

class WhereClause{
    constructor(base, bigQuery){
        this.base = base;
        this.bigQuery = bigQuery;
    }

    search(){
         const searchWord = this.bigQuery.search ? {
            name: {
                $regex: this.bigQuery.search,
                $options: 'i'
            }
         } : {}

         this.base = this.base.find({...searchWord});
         return this;
    }

    filter(){
        const copyQ = {...this.bigQuery}

        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        // convert bigq into a strig = copyQ

        let stringOfCopyQ = JSON.stringify(copyQ);

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte | lte | gt | lt)\b/g, m => `$${m}`)

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ);
        return this;
    }

    pager(resultPerPage){
        let currentPage = 1;
        if(this.bigQuery.page){
            currentPage = this.bigQuery.page;
        }

        const skipVal = resultPerPage*(currentPage-1);

        this.base = this.base.limit(resultPerPage).skip(skipVal);

        return this;
    }
}

module.exports = WhereClause;