const RedashClient = require('redash-client')
const vscode = require('vscode')

class Redash {
  constructor() {
    const config = vscode.workspace.getConfiguration('redash')
    const params = {
      endPoint: config.get('endPoint'),
      apiToken: config.get('apiToken'),
    }
    this.redash = new RedashClient(params)
  }

  getQueryText() {
    const editor = vscode.window.activeTextEditor
    const query = editor.document.getText()
    const tmp = query.match(/--+ *data_source_id *= *(\d+)/)
    if (!tmp) {
      vscode.window.showInformationMessage('data source id not found.')
      return false
    }
    const dataSourceId = tmp[1]
    return {
      query: query,
      data_source_id: dataSourceId,
    }
  }

  fetchQuery() {
    const query = this.getQueryText()
    return this.redash.queryAndWaitResult(query).then(resp => {
      return resp.query_result
    })
  }

  convertCsvText(query_result_json) {
    const columns = query_result_json.data.columns.map(col => col.name)
    const rows = query_result_json.data.rows.map(row => {
      return columns.map(key => row[key])
    })

    let text = columns.join(',')
    rows.forEach(row => (text += '\n' + row.join(',')))
    return text
  }

  showOutputCsv(text) {
    vscode.workspace
      .openTextDocument({ content: text, language: 'csv' })
      .then(document => {
        vscode.window.showTextDocument(document)
      })
  }

  runQuery() {
    const self = this
    this.fetchQuery()
      .then(result => {
        return self.convertCsvText(result)
      })
      .then(csvText => {
        self.showOutputCsv(csvText)
      })
  }
}

module.exports = Redash
