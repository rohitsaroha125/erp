const mysql=require("mysql")
const express=require('express')
var path=require("path")
var ejs=require('ejs')

var app=express();
const port = process.env.PORT || 1915;

const bodyParser=require('body-parser')
app.set('view engine', 'ejs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var dir = path.join(__dirname, 'public');

app.use(express.static(dir));

var obj={}

const now=new Date()

var page_no=0;

var mysqlConnection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:'',
    database: 'evertzemployee'
})


app.get("/",function(req,res){
    res.redirect("/payroll");
})

app.get('/payroll',function(req,res)
{
            var host_url="http://localhost:1913/"
            emp_data={host_url: host_url}
            res.render('payroll',emp_data);
            console.log(host_url);
})

app.get('/edit-details/:id',function(req,res)
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
            res.render('edit-details',emp_data);
        }
    })
})

app.post('/edit-details/modifyDetails/:id',urlencodedParser,function(req,res)
{
    var date_string=now.toString()
    console.log(req.body);
    console.log(date_string)
    var emp_id=req.params.id
    mysqlConnection.query("update  set date='"+req.body.date+"', employee_id='"+req.body.employee_id+"', employee_name='"+req.body.employee_name+"', designation_id='"+req.body.designation+"', annual_ctc='"+req.body.annual_ctc+"', professional_tax='"+req.body.professional_tax+"', income_tax='"+req.body.income_tax+"', provident_fund='"+req.body.provident_fund+"',esic='"+req.body.esic+"' where id='"+emp_id+"'",function(err,result)
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
    res.redirect("/contact-success");
})

app.get('/contact-success', function(req, res) {
    mysqlConnection.query("select * from  payroll_management order by id desc limit 0,10",function(err,result){
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
  });

app.get('/employee',function(req,res)
{
    res.render('employee')
})

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

app.post('/myaction',urlencodedParser,(req,res)=>{
    req.body.date=now.toString()
    console.log(req.body)
    mysqlConnection.query("insert into payroll_management (ID,EMP_ID,TRANSACTION_DATE,BASIC_SALARY,HRA,SA,PROFESSIONA_TAX,TAX_DETUCTION_FROM_SORCE,STANDARD_DETUCTION,OTHERS_DETUCTION,NET_AMOUNT) values ('1','"+req.body.employee_id+"','"+req.body.date+"','"+req.body.basic_salary+"','"+req.body.hra+"','"+req.body.sa+"','"+req.body.professional_tax+"','"+req.body.tax_deduction_from_source+"','"+req.body.standard_deduction+"','"+req.body.other_deduction+"','"+req.body.net_amount+"')",
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
    res.redirect("/contact-success");
})
