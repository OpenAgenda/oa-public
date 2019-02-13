export default {
  getDraggableListItemStyle: ( isDragging, draggableStyle ) => ({
    padding: '4px',
    marginBottom: '4px',
    ...isDragging ? { background: 'white' } : {},
    ...draggableStyle
  }),
  getDraggableListStyle: isDraggingOver => ({
    padding: '4px 4px 1px',
    marginBottom: '4px'
  })
}
