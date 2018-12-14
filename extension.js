const vscode = require('vscode')
const Redash = require('./redash')

function activate(context) {
  console.log('Congratulations, your extension "vsredash" is now active!')
  let disposable = vscode.commands.registerTextEditorCommand(
    'extension.runQuery',
    function() {
      const redash = new Redash()
      redash.runQuery()
    }
  )

  context.subscriptions.push(disposable)
}
exports.activate = activate

function deactivate() {}
exports.deactivate = deactivate
