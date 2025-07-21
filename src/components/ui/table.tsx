'use client'

import { forwardRef, HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'

export interface TableColumn<T = any> {
  key: string
  title: string
  render?: (value: any, row: T) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> extends HTMLAttributes<HTMLDivElement> {
  title?: string
  columns: TableColumn<T>[]
  data: T[]
  emptyStateMessage?: string
  emptyStateIcon?: ReactNode
  actions?: ReactNode
  onRowClick?: (row: T) => void
  loading?: boolean
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right'
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
}

const Table = forwardRef<HTMLDivElement, TableProps>(
  ({ 
    title, 
    columns, 
    data, 
    emptyStateMessage = "No data available",
    emptyStateIcon = "📊",
    actions,
    onRowClick,
    loading = false,
    className, 
    ...props 
  }, ref) => {
    
    const renderCellContent = (column: TableColumn, row: any) => {
      if (column.render) {
        return column.render(row[column.key], row)
      }
      return row[column.key]
    }

    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }

    return (
      <Card ref={ref} className={cn('overflow-hidden', className)} {...props}>
        {title && (
          <CardHeader className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
              {actions && <div>{actions}</div>}
            </div>
          </CardHeader>
        )}
        
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full mb-3"></div>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-3">{emptyStateIcon}</div>
              <p className="text-sm text-gray-500">{emptyStateMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {columns.map((column) => (
                      <TableHeaderCell
                        key={column.key}
                        sortable={column.sortable}
                        align={column.align}
                        style={{ width: column.width }}
                      >
                        {column.title}
                      </TableHeaderCell>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={index}
                      className={cn(
                        'border-b border-gray-50 hover:bg-gray-50/50 transition-colors',
                        onRowClick ? 'cursor-pointer' : ''
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          align={column.align}
                        >
                          {renderCellContent(column, row)}
                        </TableCell>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
Table.displayName = 'Table'

const TableHeaderCell = forwardRef<HTMLTableHeaderCellElement, TableHeaderCellProps>(
  ({ children, sortable = false, align = 'left', className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
        alignmentClasses[align],
        sortable ? 'cursor-pointer hover:text-gray-700' : '',
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </div>
    </th>
  )
)
TableHeaderCell.displayName = 'TableHeaderCell'

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, align = 'left', className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-4 py-3 text-sm',
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
)
TableCell.displayName = 'TableCell'

export { Table, TableHeaderCell, TableCell } 