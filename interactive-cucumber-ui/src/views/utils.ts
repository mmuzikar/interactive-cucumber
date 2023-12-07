import * as vscode from 'vscode'

export function createTreeItem(label: string, icon: string) : vscode.TreeItem {
    const item = new vscode.TreeItem(label)
    item.iconPath = new vscode.ThemeIcon(icon)
    return item
}