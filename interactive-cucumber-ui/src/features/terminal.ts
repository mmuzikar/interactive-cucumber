import { ITerminalChildProcess, SimpleTerminalBackend, SimpleTerminalProcess } from 'vscode/service-override/terminal'
import ansiColors from 'ansi-colors'
import ansi from 'ansi-escape-sequences'
import * as vscode from 'vscode'
import { getJavaLSP } from './lsp'

export class TerminalBackend extends SimpleTerminalBackend {
  override getDefaultSystemShell = async (): Promise<string> => 'jshell'
  override createProcess = async (): Promise<ITerminalChildProcess> => {
    const dataEmitter = new vscode.EventEmitter<string>()
    const propertyEmitter = new vscode.EventEmitter<{
      type: string
      value: string
    }>()
    class FakeTerminalProcess extends SimpleTerminalProcess {
      history: string[] = []
      buffer: string = ""
      historyIndex: number = -1
      cursor: number = 0

      private column = 0
      async start(): Promise<undefined> {
        ansiColors.enabled = true
        this.printPrompt()
        setTimeout(() => {
          dataEmitter.fire('\u001B]0;Jshell\u0007')
        }, 0)
        this.column = 2

        return undefined
      }

      private onResponse(event: any) {
        const unicodeRegex = /\\u([\d\w]{4})/gi;
        const state = event.state
        const prompt = state === 'success' ? ansiColors.yellow : ansiColors.red
        let data: string
        switch (typeof (event.data)) {
          case 'string':
            console.log(event.data)
            data = (event.data as string).replace(unicodeRegex, (match, grp) => {
              return String.fromCharCode(parseInt(grp, 16))
            }).replaceAll('\n', '\r\n ')
            console.log(data)
            break
          case 'object':
            data = JSON.stringify(event.data)
            break
          default:
            data = event.data
            break
        }
        dataEmitter.fire(prompt('> '))
        dataEmitter.fire(data + `\r\n`)
        this.printPrompt()
        dataEmitter.fire(ansi.cursor.show)
      }

      private printPrompt() {
        dataEmitter.fire(`${ansiColors.green('>')} `)
      }

      override onDidChangeProperty = propertyEmitter.event

      override shutdown(immediate: boolean): void {
      }

      override input(data: string): void {
        if (data.length > 1) {
          const control = data.charCodeAt(2)
          switch (control) {
            case 51:
              //delete

              break
            case 65:
              //UP
              if (this.historyIndex > 0) {
                this.historyIndex = Math.max(this.historyIndex - 1, 0)
              } else {
                this.historyIndex = this.history.length - 1
              }
              this.buffer = this.history[this.historyIndex]
              dataEmitter.fire(ansi.erase.inLine(2))
              dataEmitter.fire(ansi.cursor.horizontalAbsolute(0))
              this.printPrompt()
              dataEmitter.fire(this.buffer)
              this.cursor = this.buffer.length
              dataEmitter.fire(ansi.cursor.horizontalAbsolute(3 + this.cursor))
              break
            case 66:
              //DOWN
              if (this.historyIndex > 0) {
                this.historyIndex = Math.min(this.historyIndex + 1, this.history.length - 1)
              } else {
                this.historyIndex = this.history.length + 1
              }
              this.buffer = this.history[this.historyIndex]
              dataEmitter.fire(ansi.erase.inLine(2))
              dataEmitter.fire(ansi.cursor.horizontalAbsolute(0))
              this.printPrompt()
              dataEmitter.fire(this.buffer)
              this.cursor = this.buffer.length
              dataEmitter.fire(ansi.cursor.horizontalAbsolute(3 + this.cursor))
              break
            case 68:
              //LEFT
              if (this.cursor > 0) {
                this.cursor -= 1
                dataEmitter.fire(ansi.cursor.back())
              }
              break
            case 67:
              //RIGHT
              if (this.cursor < this.buffer.length) {
                this.cursor += 1
                dataEmitter.fire(ansi.cursor.forward())
              }
              break
          }
          console.log(this.cursor)
        } else {
          if (data === '\r') { // Enter
            getJavaLSP().languageClient?.sendRequest('jshell/eval', { script: this.buffer }).then(this.onResponse.bind(this))
            this.history.push(this.buffer)
            dataEmitter.fire('\r\n')
            dataEmitter.fire(ansi.cursor.hide)
            this.buffer = '';
            return;
          }
          if (data === '\x7f') { // Backspace
            if (this.buffer.length === 0) {
              return;
            }
            this.buffer = this.buffer.slice(0, this.cursor - 1) + this.buffer.slice(this.cursor);
            this.cursor -= 1
            // Move cursor backward
            dataEmitter.fire('\x1b[D');
            // Delete character
            dataEmitter.fire('\x1b[P');
            return;
          }
          this.historyIndex = -1
          const str = ansiColors.unstyle(data)
          this.buffer += str;
          this.cursor += str.length;
          dataEmitter.fire(str);
        }
      }

      resize(cols: number, rows: number): void {
      }

      override clearBuffer(): void | Promise<void> {
      }
    }
    return new FakeTerminalProcess(1, 1, '/tmp', dataEmitter.event)
  }
}