const express = require('express')

const path = require('path')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const app = express()

const format = require('date-fns/format')

const isMatch = require('date-fns/isMatch')

var isValid = require('date-fns/isValid')

app.use(express.json())

let db

const dbpath = path.join(__dirname, 'todoApplication.db')

const intialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server started')
    })
  } catch (e) {
    console.log(`${e.message}`)
    process.exit(1)
  }
}
intialize()

const answer = obj => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
    category: obj.category,
    dueDate: obj.due_date,
  }
}

const hasPriorityAndStatus = query => {
  return query.priority !== undefined && query.status !== undefined
}

const hasCategoryAndStatus = query => {
  return query.category !== undefined && query.status !== undefined
}

const hasCategoryAndPriority = query => {
  return query.priority !== undefined && query.category !== undefined
}

const hasPriority = query => {
  return query.priority !== undefined
}

const hasStatus = query => {
  return query.status !== undefined
}

const hasCategory = query => {
  return query.category !== undefined
}

const hasSearchQuery = query => {
  return query.search_q !== undefined
}

app.get('/todos/', async (request, response) => {
  let result1 = null
  let dbquery1 = ''
  const query1 = request.query
  const {search_q = '', priority, status, category} = query1

  switch (true) {
    case hasPriorityAndStatus(query1):
      if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
        if (
          status === 'TO DO' ||
          status === 'DONE' ||
          status === 'IN PROGRESS'
        ) {
          dbquery1 = `select * from todo where priority="${priority}" and status="${status}";`
          result1 = await db.all(dbquery1)
          response.send(result1.map(eachmember => answer(eachmember)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case hasCategoryAndStatus(query1):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'DONE' ||
          status === 'IN PROGRESS'
        ) {
          dbquery1 = `select * from todo where category="${category}" and status="${status}";`
          result1 = await db.all(dbquery1)
          response.send(result1.map(eachmember => answer(eachmember)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case hasCategoryAndPriority(query1):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'LOW' ||
          priority === 'MEDIUM' ||
          priority === 'HIGH'
        ) {
          dbquery1 = `select * from todo where category="${category}" and priority="${priority}";`
          result1 = await db.all(dbquery1)
          response.send(result1.map(eachmember => answer(eachmember)))
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Category')
      }
      break

    case hasCategory(query1):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        dbquery1 = `select * from todo where category="${category}";`
        result1 = await db.all(dbquery1)
        response.send(result1.map(eachmember => answer(eachmember)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case hasPriority(query1):
      if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
        dbquery1 = `select * from todo where priority="${priority}";`
        result1 = await db.all(dbquery1)
        response.send(result1.map(eachmember => answer(eachmember)))
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case hasStatus(query1):
      if (status === 'TO DO' || status === 'DONE' || status === 'IN PROGRESS') {
        dbquery1 = `select * from todo where status="${status}";`
        result1 = await db.all(dbquery1)
        response.send(result1.map(eachmember => answer(eachmember)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break

    case hasSearchQuery(query1):
      dbquery1 = `select * from todo where todo like "%${search_q}%";`
      result1 = await db.all(dbquery1)
      response.send(result1.map(eachmember => answer(eachmember)))

    default:
      dbquery1 = `select * from todo;`
      result1 = await db.all(dbquery1)
      response.send(result1.map(eachmember => answer(eachmember)))
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  const parameter2 = request.params
  const {todoId} = parameter2
  const dbquery2 = `select * from todo where id=${todoId};`
  const result2 = await db.get(dbquery2)
  response.send(answer(result2))
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  console.log(isMatch(date, 'yyyy-MM-dd'))

  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    console.log(newDate)
    const dbquery3 = `select * from todo where due_date="${newDate}";`
    const result3 = await db.all(dbquery3)
    response.send(result3.map(eachmember => answer(eachmember)))
  } else {
    response.status(400)
    response.send(`Invalid Due Date`)
  }
})

app.post('/todos/', async (request, response) => {
  const body4 = request.body
  const {id, todo, priority, status, category, dueDate} = body4
  if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'HOME' ||
        category === 'WORK' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const newDate2 = format(new Date(dueDate), 'yyyy-MM-dd')
          const dbquery4 = `insert into todo (id,todo,category,priority,status,due_date)
                 values (
                  ${id},
                  "${todo}","${category}","${priority}",
                  "${status}","${newDate2}"
                 );`
          const result4 = await db.run(dbquery4)
          response.send(`Todo Successfully Added`)
        } else {
          response.status(400)
          response.send(`Invalid Due Date`)
        }
      } else {
        response.status(400)
        response.send(`Invalid Todo Category`)
      }
    } else {
      response.status(400)
      response.send(`Invalid Todo Status`)
    }
  } else {
    response.status(400)
    response.send(`Invalid Todo Priority`)
  }
})

app.put("/todos/:todoId/", async (request,response)=>{
  let dbquery5="";
  let result5;
  const parameter5=request.params;
  const{todoId}=parameter5
  const body5=request.body;
  const getquery=`select * from todo where id="${todoId}";`;
  const getqueryresult=await db.get(getquery);
  const {
    todo=getqueryresult.todo,priority=getqueryresult.priority,status=getqueryresult.status,category=getqueryresult.category,dueDate=getqueryresult.dueDate
  }=body5;
  switch(true){
    case body5.priority!==undefined:
    if(priority==="LOW"||priority==="MEDIUM"||priority==="HIGH"){
      dbquery5=`update todo set todo="${todo}",category="${category}",priority="${priority}",status="${status}" due_date="${dueDate}";`;
      result5=await db.run(dbquery5);
      response.send("Priority Updated");
    }else{
      response.status(400);
      response.send(`Invalid Todo Priority`);
    }
    break;

    case body5.status!==undefined:
    if(status==="TO DO"||status==="IN PROGRESS"||status==="DONE"){
      dbquery5=`update todo set todo="${todo}",category="${category}",priority="${priority}",status="${status}" due_date="${dueDate}";`;
      result5=await db.run(dbquery5);
      response.send("Status Updated");
    }else{
      response.status(400);
      response.send(`Invalid Todo Status`);
    }
    break;

    case body5.category!==undefined:
    if(category==="WORK"||category==="HOME"||category==="LEARNING"){
      dbquery5=`update todo set todo="${todo}",category="${category}",priority="${priority}",status="${status}" due_date="${dueDate}";`;
      result5=await db.run(dbquery5);
      response.send(`Category Updated`);
    }else{
      response.status(400);
      response.send(`Invalid Todo Category`)
    }
    break;

    case body5.todo!==undefined:
      dbquery5=`update todo set todo="${todo}",category="${category}",priority="${priority}",status="${status}" due_date="${dueDate}";`;
      result5=await db.run(dbquery5);
      response.send(`Todo Updated`);
    break;

    case body5.dueDate!==undefined:
    if (isMatch(dueDate,"yyyy-MM-dd")){
      const newdate5=format(new Date(dueDate),"yyyy-MM-dd");
      dbquery5=`update todo set todo="${todo}",category="${category}",priority="${priority}",status="${status}" due_date="${dueDate}";`;
      result5=await db.run(dbquery5);
      response.send(`Due Date Updated`);

    }else{
      response.status(400);
      response.send("Invalid Due Date");
    }
    break;

  }

})

app.delete("/todos/:todoId/",async (request,response)=>{
  const parameter6=request.params;
  const {todoId}=parameter6;
  const dbquery6=`delete from todo where id="${todoId}";`;
  const result6=await db.run(dbquery6);
  response.send(`Todo Deleted`);
})

module.exports = app;
