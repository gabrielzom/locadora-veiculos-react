import { useState } from 'react'
import './App.css'
import axios from 'axios'
import { 
  Grid,
  Button,
  TextField, 
  Tab, 
  Tooltip, 
} from '@mui/material'
import { TabPanel, TabList, TabContext } from '@mui/lab'
import { operations } from './assets/resources'
import { DataGrid } from '@mui/x-data-grid';

const apiUrl = 'http://localhost:8080'

const App = () => {

  const [ currentOperation, setCurrentOperation ] = useState(operations[0])
  const [ currentTab, setCurrentTab ] = useState(currentOperation.value)
  const [ generatedSQLs, setGeneratedSQLs ] = useState([])
  const [ fields, setFields ] = useState({
    cnpj: '',
    viagem: '',
    placa: '',
    cliente: '',
    km_veiculo: '',
    cpf: '',
    cnh: '',
  })

  const [ columns , setColumns ] = useState([])
  const [ rows , setRows ] = useState([])

  
  const handleChangeTab = (evento, value) => {
    setCurrentOperation(operations.filter(operation => operation.value === value)[0])
    setCurrentTab(value)
    setGeneratedSQLs([])
    setFields({
      cnpj: '',
      viagem: '',
      placa: '',
      cliente: '',
      km_veiculo: '',
      cpf: '',
      cnh: '',
    })
  }

  const executeOperationRequest = async (operation) => {
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

    let body = {}

    headquarters.forEach((sql, index) => body['script'+index] = sql[sql.length-1])

    if(!body.script0) body.script0 = operation.scriptSQL[0]    

    setGeneratedSQLs(Object.keys(body).map(sql => body[sql]))
    
    const { data } = await axios.post(apiUrl.concat('/', operation.value), body)

    const dataGridHeaders = data.columns.map(column => column.name)

    setColumns(dataGridHeaders.map(header => {
      return {
        field: header,
        headerName: header.replaceAll('_', ' ').toUpperCase(),
        width: 150
      }
    }))
    if(!data.rows[0].id) {
      setRows(data.rows.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        }
      }))
    } else {
      setRows(data.rows)
    }
    
  }

  return (
    <Grid>
      <h1 style={{ fontSize: '2rem' }}>Locadora de Veículos - Operações intuitivas com SQL</h1>
      <Grid>
      <TabContext value={currentTab}>
        <TabList onChange={handleChangeTab}>
          {operations.map((operation, indexTab) =>
          <Tab 
            key={indexTab}
            value={operation.value}
            style={{ outline: 'none', width: '180px', fontSize: '12px', fontWeight: 'bold' }} 
            label={operation.title}
          />
          )}
        </TabList>
        <TabPanel value={currentTab}>
          {operations.map((operation, indexOperation) =>
            operation.value === currentTab 
              ? <Grid
                  key={indexOperation}
                  style={{
                    textAlign: 'left', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }} 
                >
                    <Grid 
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <Grid 
                        style={{}}
                      >
                        {operation.params.map((param, indexParam) =>
                          <Grid key={indexParam}>
                            {param.optional ? (
                                <p 
                                  style={{ 
                                    padding: 0, 
                                    marginBottom: '.2rem', 
                                    fontSize: '.8rem', 
                                    color: 'blue' 
                                  }}
                                >
                                  Parâmetro opcional
                                </p>
                              ) : (
                                <p 
                                  style={{ 
                                    padding: 0, 
                                    marginBottom: '.2rem', 
                                    fontSize: '.8rem', 
                                    color: 'red' 
                                  }}
                                >
                                  * Parâmetro obrigatório
                                </p>
                              )
                            }  
                            <TextField
                              style={{
                                marginBottom: '3rem',
                                width: '400px',
                                height: '15px'
                              }}
                              label={param.label}
                              variant='outlined'
                              onChange={event => setFields({...fields, [param.name]: event.target.value})}
                            />
                          </Grid>
                        )} {!operation.params.length && <h2>Operação sem parâmetros</h2>}
                        <Grid
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '1000px'

                          }}
                        >
                          <h3>Script(s) SQL da operação:</h3>
                            {operation.scriptSQL.map((sql, indexSql)=> 
                              <h4 key={indexSql} style={{ fontFamily: 'monospace', backgroundColor: 'lightgray' }}>{sql}</h4>
                            )}
                          <h5>Obs: Os parâmetros substituirão as palavras que comecam com '$'.</h5>
                        </Grid>
                      </Grid>
                    </Grid>
                  <Grid 
                    style={{
                      marginTop: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      maxWidth: '800px',
                    }}
                  >
                    <Tooltip title={ 'Clique para executar a operação de ' + operation.title } arrow>
                      <Button
                        variant='contained'
                        style={{
                          fontWeight: 'bold',
                          width: '500px'
                        }}
                        onClick={async () => await executeOperationRequest(currentOperation)}
                      >
                        Executar operação
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid 
                    style={{
                      marginTop: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      maxWidth: '1000px',
                      justifyContent: 'center'
                    }}
                  >
                    <h3>Script(s) SQL GERADOS: </h3>
                      {generatedSQLs.map((genSQL, indexGenSQL) => 
                        <h4 key={indexGenSQL} style={{ fontFamily: 'monospace', backgroundColor: 'lightgreen' }}>{genSQL}</h4>)
                      }
                  </Grid>
                </Grid>
              : <></>
          )}
        </TabPanel>
        <h2>Resultado da última operação</h2>
        <DataGrid 
          style={{ height: 400, width: '100%' }}
          rows={rows}
          columns={columns}
          pageSize={50}
          rowsPerPageOptions={[50]}
          checkboxSelection
        />
      </TabContext>
    </Grid>
  </Grid>
  )
}

export default App
