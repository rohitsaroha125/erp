const mysql=require("mysql")
const express=require('express')
var path=require("path")
var ejs=require('ejs')
const session=require('express-session')
const cookieParser = require('cookie-parser');

var app=express();
const port = process.env.PORT || 1915;

const bodyParser=require('body-parser')
app.set('view engine', 'ejs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(session({secret: 'qweasdzxc',saveUninitialized:true, resave: false}))
app.use(cookieParser());

var dir = path.join(__dirname, 'public');

var authenticate=function(req,res,next)
{
    if(req.session.isAuthenticated || req.cookies['name'])
    {
        return next()
    }
    else
    {
        res.redirect("../login")
    }
}

app.set('views', __dirname + '/views');

app.use(express.static(dir));
app.use('/secret',authenticate, express.static(path.join(__dirname, 'secret')));


var obj={}

const now=new Date()

var page_no=0;

var mysqlConnection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:'',
    database: 'evertzemployee'
})

app.all("/",function(req,res){
    res.redirect("secret/payroll");
})


app.get('/secret/payroll',function(req,res)
{
    console.log(req.cookies['name'])
    res.render("../secret/payroll");
})

app.get('/fetch_id',function(req,res)
{
    var emp_id=req.query.send_data
    mysqlConnection.query("select count(*) as count_emp from employee where ID='"+emp_id+"'",function(err1,result1){
        if(err1)
        {
            throw err1
        }
        else
        {
            console.log(result1[0].count_emp)
            if(result1[0].count_emp==0)
            {
                console.log(result1)
                res.send("Employee doesn't exist")
                console.log("employee doesn't exist")
            }
            else
            {
                mysqlConnection.query("select count(*) as Count_id from payroll_management  where EMP_ID='"+emp_id+"'",function(err,result)
                {
                    if(err)
                    {
                        throw err
                    }
                    else
                    {
                        if(result[0].Count_id!=0)
                    {
                        res.send("Employee Payroll already exists")
                    }
                }
            })
            }
        }
    })
})

app.get("/secret/logout",function(req,res)
{
    if(req.session.isAuthenticated || req.cookies['name']==1)
    {
        res.clearCookie('name');
        req.session.destroy(function(err)
        {
            if(err)
            {
                console.log(err)
            }
            else
            {
                res.redirect("../login")
            }
        })
    }
})

app.get('/login',function(req,res)
{
    res.render("login")
})

app.get('/secret/edit-details/:id',function(req,res)
{
    var emp_id=req.params.id;
    mysqlConnection.query("select * from payroll_management where id='"+emp_id+"'",function(err,result)
    {
        if(err)
        {
            throw err
        }
        else
        {
            emp_data={my_data :result}
            res.render('../secret/edit-details',emp_data);
        }
    })
})

app.post('/loginAction',urlencodedParser,function(req,res)
{
    mysqlConnection.query("select id,count(*) AS Count_rows from user where USERNAME='"+req.body.username+"' and PASSWORD='"+req.body.password+"'",function(err,result)
    {
        if(err)
        {
            throw err
        }
        else
        {
            var count_rows=result[0].Count_rows
            if(count_rows!=1)
            {
                req.session.isAuthenticated=false
                res.render('login-fail')
            }
            else
            {
                req.session.isAuthenticated=true
                res.cookie('name', result[0].id, {expire: 36000000 + Date.now()});
                res.redirect('../secret/payroll')
            }
        }
    })
})

app.get('/secret/contact-success', function(req, res) {
    mysqlConnection.query("select * from  payroll_management order by id desc limit 0,10",function(err,result){
        if(err)
        {
            throw err
        }
        else
        {
            obj = {print: result};
            res.render('../secret/contact-success', obj);
        }
    })
  });

app.listen(port,()=> console.log("express server running"))

app.get('/prev',function(req,res)
{
    var new_limit;
    console.log(page_no)
    if(page_no>0)
    {
        page_no=page_no-1;
        new_limit=(page_no*10);
        mysqlConnection.query("select * from payroll_management order by id desc limit "+new_limit+",10",function(err,result)
    {
        if(err)
        {
            throw err
        }
        else
        {
            obj = {print: result};
            console.log(obj);
            res.render('contact-success', obj);
        }
    })
    }
    else
    {
        mysqlConnection.query("select * from payroll_management order by id desc limit 0,10",function(err,result)
    {
        if(err)
        {
            throw err
        }
        else
        {
            obj = {print: result};
            console.log(obj);
            res.render('contact-success', obj);
        }
    })
    }
})

app.get('/next',function(req,res)
{
    var new_limit;
    page_no=page_no+1;
    new_limit=(page_no*10);
        mysqlConnection.query("select * from payroll_management order by id desc limit "+new_limit+",10",function(err,result)
    {
        if(err)
        {
            throw err
        }
        else
        {
            obj = {print: result};
            res.render('contact-success', obj);
        }
    })
})

app.post('/secret/edit-details/modifyDetails/:id',urlencodedParser,function(req,res)
{
    var date_string=now.toString()
    console.log(req.body);
    console.log(date_string)
    var emp_id=req.params.id
    mysqlConnection.query("update payroll_management set TRANSACTION_DATE='"+req.body.date+"', EMP_ID='"+req.body.employee_id+"',BASIC_SALARY='"+req.body.basic_salary+"', HRA='"+req.body.hra+"', SA='"+req.body.sa+"', PROFESSIONA_TAX='"+req.body.professional_tax+"', TAX_DETUCTION_FROM_SORCE='"+req.body.tax_source+"', STANDARD_DETUCTION='"+req.body.standard_deduction+"', OTHERS_DETUCTION='"+req.body.other_deductions+"', NET_AMOUNT='"+req.body.net_amount+"' where ID='"+emp_id+"'",function(err,result)
    {
        if(err)
        {
            throw err
        }
        else
        {
            console.log("updated successfully")
        }
    })
    res.redirect("/secret/contact-success");
})

app.post('/secret/myaction',urlencodedParser,(req,res)=>{
    req.body.date=now.toString()
    mysqlConnection.query("insert into payroll_management (ID, EMP_ID, TRANSACTION_DATE, BASIC_SALARY, HRA, SA, PROFESSIONA_TAX, TAX_DETUCTION_FROM_SORCE, STANDARD_DETUCTION, OTHERS_DETUCTION, NET_AMOUNT) values ('','"+req.body.employee_id+"','"+req.body.date+"','"+req.body.basic_salary+"','"+req.body.hra+"','"+req.body.sa+"','"+req.body.professional_tax+"','"+req.body.tax_source+"','"+req.body.standard_deduction+"','"+req.body.other_deductions+"','"+req.body.net_amount+"')",
    function(err)
    {
        if(err)
        {
            throw err
        }
        else
        {
            console.log('added succesfully')
        }
    })
    res.redirect("../secret/contact-success");
})
