class CraftingEventbus
{
  constructor()
  {
    this.observer = {}
  }

  emit(cid, name, data, socket)
  {
    cid in this.componentObserveers
    && this.observer[cid].on(name, data, socket)
  }

  setObserver(cid, observer)
  {
    this.observer[cid] = observer
  }
}

module.exports = CraftingEventbus