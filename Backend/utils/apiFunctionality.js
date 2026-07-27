class APIFunctionality {

    constructor(query, queryStr) {

        this.query = query,
            this.queryStr = queryStr

    };

    search() {
        const keyword = this.queryStr.keyword ? {
            $or: [
                { name: { $regex: this.queryStr.keyword, $options: "i" } },
                { keywords: { $regex: this.queryStr.keyword, $options: "i" } },
                { description: { $regex: this.queryStr.keyword, $options: "i" } }
            ]
        } : {};

        console.log("Keyword filter:", keyword);

        this.query = this.query.find({ ...keyword });
        console.log("Mongo query after search:", this.query.getQuery());
        return this;
    }


    filter() {
        const queryCopy = { ...this.queryStr };
        console.log("Query before removing fields:", queryCopy);

        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key => delete queryCopy[key]);

        console.log("Query after removing fields:", queryCopy);

        // Convert price[gte]=100&price[lte]=500 style params into MongoDB operators
        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const parsedQuery = JSON.parse(queryString);

        this.query = this.query.find(parsedQuery);
        console.log("Mongo query after filter:", this.query.getQuery());

        return this;
    }


    pagination(resultPerPage) {

        const currentPage = (+this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this


    }

};

export default APIFunctionality;