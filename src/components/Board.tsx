import type { CardType } from '../types'
import CardItem from './CardItem'
import { Box } from '@mui/material'

interface BoardProps {
    cards: CardType[]
    onSelect: (card: CardType) => void
    choice1: CardType | null
    choice2: CardType | null
}

export default function Board({ cards, onSelect, choice1, choice2 }: BoardProps) {
    const gridSize = Math.sqrt(cards.length)

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: 2,
                maxWidth: 600,
                margin: '20px auto'
            }}
        >
            {cards.map(card => (
                <CardItem
                    key={card.id}
                    card={card}
                    flipped={card === choice1 || card === choice2 || card.matched}
                    onSelect={() => onSelect(card)}
                />
            ))}
        </Box>
    )
}
