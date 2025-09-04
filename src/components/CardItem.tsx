import { Card, CardActionArea, Typography, Box } from '@mui/material'
import type { CardType } from '../types'

interface CardItemProps {
    card: CardType
    flipped: boolean
    onSelect: () => void
}

export default function CardItem({ card, flipped, onSelect }: CardItemProps) {
    return (
        <Card
            onClick={onSelect}
            sx={{
                width: 100,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
        >
            <CardActionArea sx={{ height: '100%' }}>
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: flipped ? '#fff' : '#1976d2'
                    }}
                >
                    <Typography variant="h4">
                        {flipped ? card.content : '❓'}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    )
}
