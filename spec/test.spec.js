var Request = require('request')
var test_config = require('./test_config.json')
describe('Guest lecture', () => {
    it('Should Render login Page', (done) => {
        let options = {
            url: `${test_config.baseURL}/`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should Render Student signup', (done) => {
        let options = {
            url: `${test_config.baseURL}/student/signup`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should Render student OD with ID=CB.EN.U4CSE18213', (done) => {
        let options = {
            url: `${test_config.baseURL}/student/od/CB.EN.U4CSE18213`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should Render student page with ID=CB.EN.U4CSE18213', (done) => {
        let options = {
            url: `${test_config.baseURL}/student/CB.EN.U4CSE18213`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should Render student OD with ID=CB.EN.U4CSE18213', (done) => {
        let options = {
            url: `${test_config.baseURL}/student/od/CB.EN.U4CSE18213`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should Render admin home page', (done) => {
        let options = {
            url: `${test_config.baseURL}/admin`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should Render admin page with functionalities', (done) => {
        let options = {
            url: `${test_config.baseURL}/admin/func`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should edit faculty details of cse103 in admin page', (done) => {
        let options = {
            url: `${test_config.baseURL}/admin/edit/fac/cse104`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(500)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('Should  delete faculty with id=cse104', (done) => {
        let options = {
            url: `${test_config.baseURL}/admin/fac/delete/cse104`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should delete guest_id=9', (done) => {
        let options = {
            url: `${test_config.baseURL}/admin/guest/delete/9`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('delete hall with id=1', (done) => {
        let options = {
            url: `${test_config.baseURL}/admin/hall/delete/1`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('delete classroom with id=1', (done) => {
        let options = {
            url: `${test_config.baseURL}/admin/class/delete/1`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    

    it('should render invitation page', (done) => {
        let options = {
            url: `${test_config.baseURL}/invite`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should render request home page', (done) => {
        let options = {
            url: `${test_config.baseURL}/request`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should render signup home page', (done) => {
        let options = {
            url: `${test_config.baseURL}/signup`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should update student page with ID=CB.EN.U4CSE18213', (done) => {
        let options = {
            url: `${test_config.baseURL}/student/update/CB.EN.U4CSE18213`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should render student with id=CB.EN.U4CSE18213 as volunteer', (done) => {
        let options = {
            url: `${test_config.baseURL}/student/volunteer/CB.EN.U4CSE18213`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should render lecture with ID=22', (done) => {
        let options = {
            url: `${test_config.baseURL}/lecture/edit/22`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

   

    it('should render lecture with ID=1', (done) => {
        let options = {
            url: `${test_config.baseURL}/lecture/1`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should enable the student to view lecture page with id=22', (done) => {
        let options = {
            url: `${test_config.baseURL}/lecture/student-view/22`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should display OD with ID=1', (done) => {
        let options = {
            url: `${test_config.baseURL}/lecture/od/1`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should render rooms page with all rooms', (done) => {
        let options = {
            url: `${test_config.baseURL}/rooms`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should render booking page with id=1', (done) => {
        let options = {
            url: `${test_config.baseURL}/bookings/1`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });

    it('should render forgot page', (done) => {
        let options = {
            url: `${test_config.baseURL}/forgot`
            
        };
        Request.get(options,(err,res)=>{
            expect(res.statusCode).toBe(200)
            expect(res.headers).toBeDefined()
            expect(res.body).toContain('html')
            done();
        })
    });


});