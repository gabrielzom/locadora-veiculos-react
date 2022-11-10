import axios from 'axios'

const executeOperationRequest = async (operation, fields) => {
  try {
    let body = {}
    let rows = []
    const apiUrl = 'https://locadora-pti-bd.herokuapp.com'

    const headquarters = operation.scriptSQL.map(sql => 
     operation.params.map(param => {
       if(sql.includes(`$${param.name}`)) {
         if (param.type === 'string') {
           sql = sql.replaceAll(`$${param.name}`, `'${fields[param.name]}'`)
         } else {
           sql = sql.replaceAll(`$${param.name}`, fields[param.name])
         }
       }
       return sql
     })
    )

    headquarters.forEach((sql, index) => body['script'+index] = sql[sql.length-1])
    if(!body.script0) body.script0 = operation.scriptSQL[0]

    const generatedSQLs = Object.keys(body).map(sql => body[sql])

    const { data } = await axios.post(apiUrl.concat('/', operation.value), body)
    const dataGridHeaders = data.columns.map(column => column.name)

    const columns = dataGridHeaders.map(header => {
      return {
        field: header,
        headerName: header.replaceAll('_', ' ').toUpperCase(),
        width: 150
      }
    })

     if(!data.rows[0].id) {
       rows = data.rows.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        }
      })
    } else {
       rows = data.rows
    }

    return {
     isLoadingRequest: false,
     generatedSQLs,
     rows,
     columns,
    }
  } catch(e) {
    console.log(e)
    alert('Ocorreu um erro durante a requisição.\nCerifique-se de preencher os parâmetros corretamente e chegue o log.')
    return {
      isLoadingRequest: false,
      generatedSQLs: [],
      rows: [],
      columns: [],
     }
  }
}

export default executeOperationRequest