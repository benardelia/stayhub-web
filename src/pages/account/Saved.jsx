import { getFavourites } from '../../api/guest'
import { usePaged } from '../../lib/query'
import { plural } from '../../lib/format'
import { useFavourites } from '../../hooks/useFavourites'
import { HotelGrid } from '../../components/site/HotelCard'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import { PageSpinner } from '../../components/ui/Spinner'
import { Empty, ErrorBox, LoadMore } from '../../components/ui/States'

export default function Saved() {
  const fav = useFavourites()
  const list = usePaged(['favourites', 'list'], getFavourites, { limit: 24 })

  return (
    <>
      <PageHeader title="Saved" subtitle={list.total != null ? `${plural(list.total, 'stay')} you love` : ' '} />
      <ErrorBox error={list.error} />
      {list.isPending ? (
        <PageSpinner />
      ) : list.items.length ? (
        <>
          <HotelGrid hotels={list.items} fav={fav} />
          <LoadMore query={list} />
        </>
      ) : (
        <Empty title="Nothing saved yet" action={<Button to="/search">Explore stays</Button>}>
          Tap the heart on any stay and it will show up here.
        </Empty>
      )}
    </>
  )
}
