export const operations = [
  {
    title: 'Consultar todos os estacionamentos',
    params: [],
    value: 'park',
    scriptSQL: [
      `SELECT * FROM estacionamento`,
    ],
  },
  {
    title: 'Consultar todos os clientes',
    params: [],
    value: 'client',
    scriptSQL: [
      `SELECT * FROM cliente`,
    ],
  },
  {
    title: 'Quantidade de veículos disponíveis em todos os estacionamentos',
    params: [],
    value: 'vehicle-able',
    scriptSQL: [
      `SELECT COUNT(placa) AS 'quantidade_veiculos_disponiveis' FROM veiculo WHERE disponivel = 1`,
    ],
  },
  {
    title: 'Veículos disponíveis por determinado estacionamento',
    params: [
      {
        name: 'cnpj',
        label: 'Número de CNPJ do estacionamento',
        optional: false,
        type: 'string',
      }
    ],
    value: 'vehicle-able-by-park',
    scriptSQL: [
      `SELECT * FROM veiculo WHERE cnpj_estacionamento_atual = $cnpj AND disponivel = 1`,
    ],
  },
  {
    
    title: 'Alugar um veiculo e iniciar viagem',
    params: [

      {
        name: 'km_veiculo',
        label: 'Quilometragem atual do veículo (começo viagem)',
        optional: false,
        type: 'number',
      },
      {
        name: 'placa',
        label: 'Placa do veículo',
        optional: false,
        type: 'string',
      },
      {
        name: 'cpf',
        label: 'Número de CPF do cliente',
        optional: false,
        type: 'string',
      },
      {
        name: 'cnh',
        label: 'Número de CNH do cliente',
        optional: false,
        type: 'string',
      }
    ],
    value: 'start-trip',
    
    scriptSQL: [
      `UPDATE veiculo SET disponivel = 0 WHERE placa = $placa`,
      `INSERT INTO viagem (
        quilometragem_veiculo_origem, 
        placa_veiculo, 
        id_cliente,
        cnpj_estacionamento_origem
      ) VALUES (
        $km_veiculo,
        $placa,
        (SELECT cliente.id FROM cliente WHERE cliente.cpf = $cpf AND cliente.cnh = $cnh),
        (SELECT veiculo.cnpj_estacionamento_atual FROM veiculo WHERE placa = $placa)
      )`,
      `SELECT * FROM viagem ORDER BY id DESC`
    ],
  },
  {
    title: 'Finalizar viagem',
    params: [
      {
        name: 'viagem',
        label: 'Id da viagem',
        optional: false,
        type: 'number',
      },
      {
        name: 'km_veiculo',
        label: 'Quilometragem atual do veículo (final viagem)',
        optional: false,
        type: 'number',
      },
      {
        name: 'cnpj',
        label: 'Número de CNPJ do estacionamento (final viagem)',
        optional: false,
        type: 'string',
      }
    ],
    value: 'end-trip',
    scriptSQL: [
      `UPDATE viagem 
        SET 
          quilometragem_veiculo_destino = $km_veiculo, 
          cnpj_estacionamento_destino = $cnpj
        WHERE id = $viagem
      `,
      `UPDATE veiculo SET disponivel = 1 WHERE placa = (SELECT placa_veiculo FROM viagem WHERE id = $viagem)`,
      `SELECT * FROM viagem ORDER BY id DESC`
    ],
  },
  {
    title: 'Realizar pagamento da viagem',
    params: [
      {
        name: 'viagem',
        label: 'Id da viagem',
        optional: false,
        type: 'number',
      }
    ],
    value: 'make-payment',
    scriptSQL: [
      `INSERT INTO cobranca (
        id_viagem, 
        valor_total_viagem
      ) VALUES (
        $viagem,
        ((
          SELECT (quilometragem_veiculo_destino - quilometragem_veiculo_origem) 
          FROM viagem WHERE viagem.id = $viagem
        ) 
        * 
        (
          SELECT veiculo.tarifa 
          FROM veiculo, viagem WHERE placa = (SELECT placa_veiculo FROM viagem WHERE viagem.id = $viagem) LIMIT 1
        ))
      )`,
      `SELECT * FROM cobranca`,
    ],
  },
  {
    title: 'Consultar viagens',
    params: [
      {
        name: 'viagem',
        label: 'Id da viagem',
        optional: false,
        type: 'number',
      },
      {
        name: 'placa',
        label: 'Placa do veículo',
        optional: false,
        type: 'string',
      },
      {
        name: 'cliente',
        label: 'Id do cliente',
        optional: false,
        type: 'number',
      }
    ],
    value: 'trip',
    scriptSQL: [
      `SELECT * FROM viagem WHERE id = $viagem AND placa_veiculo = $placa AND id_cliente = $cliente`
    ],
  },
]


