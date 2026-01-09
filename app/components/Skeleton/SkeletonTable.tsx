import React from 'react'

import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

interface SkeletonTableRowProps {
  columns: number
}

/**
 * Skeleton for a single table row.
 */
const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({ columns }) => {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton animation="wave" variant="text" width="80%" height={24} />
        </TableCell>
      ))}
    </TableRow>
  )
}

interface SkeletonTableProps {
  columns?: number
  rows?: number
  showHeader?: boolean
  showCard?: boolean
  showSearch?: boolean
  showPagination?: boolean
}

/**
 * Skeleton placeholder for table-based admin lists.
 * Matches the layout of VerbsList, NounsList, AdjectivesList, etc.
 *
 * @param columns - Number of columns in the table (default: 6)
 * @param rows - Number of skeleton rows to render (default: 5)
 * @param showHeader - Whether to show table header skeleton (default: true)
 * @param showCard - Whether to wrap in Card component (default: true)
 * @param showSearch - Whether to show search field skeleton (default: true)
 * @param showPagination - Whether to show pagination skeleton (default: true)
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  columns = 6,
  rows = 5,
  showHeader = true,
  showCard = true,
  showSearch = true,
  showPagination = true,
}) => {
  const tableContent = (
    <>
      {showSearch && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Skeleton animation="wave" variant="text" width={200} height={32} />
            <Skeleton
              animation="wave"
              variant="circular"
              width={32}
              height={32}
            />
          </Box>
          <Skeleton
            animation="wave"
            variant="rounded"
            width={250}
            height={40}
          />
        </Box>
      )}

      <TableContainer>
        <Table size="small">
          {showHeader && (
            <TableHead>
              <TableRow>
                {Array.from({ length: columns }).map((_, index) => (
                  <TableCell key={index}>
                    <Skeleton
                      animation="wave"
                      variant="text"
                      width="70%"
                      height={20}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <SkeletonTableRow key={index} columns={columns} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mt: 2,
            gap: 2,
          }}
        >
          <Skeleton animation="wave" variant="text" width={120} height={24} />
          <Skeleton animation="wave" variant="rounded" width={80} height={32} />
          <Skeleton animation="wave" variant="text" width={80} height={24} />
          <Box display="flex" gap={0.5}>
            <Skeleton
              animation="wave"
              variant="circular"
              width={32}
              height={32}
            />
            <Skeleton
              animation="wave"
              variant="circular"
              width={32}
              height={32}
            />
          </Box>
        </Box>
      )}
    </>
  )

  if (showCard) {
    return (
      <Card>
        <CardContent>{tableContent}</CardContent>
      </Card>
    )
  }

  return tableContent
}
