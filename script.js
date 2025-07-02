// Formatador de moeda brasileiro
const formatadorBR = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function formatarInput(input) {
  let valor = input.value.replace(/\D/g, '');
  if (valor === '') {
    input.value = '';
    return;
  }
  valor = (parseInt(valor) / 100).toFixed(2);
  valor = valor.replace('.', ',');
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = valor;
}

function limparCampos() {
  document.getElementById("valor").value = "";
  document.getElementById("entrada").value = "";
  document.getElementById("juros").value = "";
  document.getElementById("prazo").value = "";
  document.getElementById("tipo").value = "price";
  document.getElementById("resultado").innerHTML = "";
}

function calcular() {
  const valor = parseFloat(document.getElementById("valor").value.replace(/\./g, '').replace(',', '.'));
  const entrada = parseFloat(document.getElementById("entrada").value.replace(/\./g, '').replace(',', '.'));
  const jurosAnual = parseFloat(document.getElementById("juros").value);
  const prazo = parseInt(document.getElementById("prazo").value);
  const tipo = document.getElementById("tipo").value;

  if (isNaN(valor) || isNaN(entrada) || isNaN(jurosAnual) || isNaN(prazo)) {
    alert("Por favor, preencha todos os campos corretamente.");
    return;
  }

  const entradaMinima = valor * 0.2;
  if (entrada < entradaMinima) {
    alert("⚠️ A entrada é inferior a 20% do valor do imóvel. A simulação continuará mesmo assim.");
  }

  const financiamento = valor - entrada;
  const jurosMensal = jurosAnual / 100 / 12;
  let parcelas = [];

  if (tipo === "price") {
    const p = financiamento * (jurosMensal / (1 - Math.pow(1 + jurosMensal, -prazo)));
    let saldo = financiamento;
    for (let i = 1; i <= prazo; i++) {
      const juros = saldo * jurosMensal;
      const amortizacao = p - juros;
      saldo -= amortizacao;
      parcelas.push({
        parcela: i,
        amortizacao,
        juros,
        total: p,
        saldo: saldo > 0 ? saldo : 0
      });
    }
  } else if (tipo === "sac") {
    const amortizacao = financiamento / prazo;
    let saldo = financiamento;
    for (let i = 1; i <= prazo; i++) {
      const juros = saldo * jurosMensal;
      const total = amortizacao + juros;
      saldo -= amortizacao;
      parcelas.push({
        parcela: i,
        amortizacao,
        juros,
        total,
        saldo: saldo > 0 ? saldo : 0
      });
    }
  }

  let html = `
    <p><strong>Valor financiado:</strong> ${formatadorBR.format(financiamento)}</p>
    <table>
      <tr>
        <th>Parcela</th>
        <th>Amortização</th>
        <th>Juros</th>
        <th>Total</th>
        <th>Saldo</th>
      </tr>`;

  parcelas.forEach(p => {
    html += `
      <tr>
        <td>${p.parcela}</td>
        <td>${formatadorBR.format(p.amortizacao)}</td>
        <td>${formatadorBR.format(p.juros)}</td>
        <td>${formatadorBR.format(p.total)}</td>
        <td>${formatadorBR.format(p.saldo)}</td>
      </tr>`;
  });

  html += `</table>`;
  document.getElementById("resultado").innerHTML = html;
}
