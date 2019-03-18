export default {
  getDraggableListItemStyle: ( isDragging, draggableStyle ) => ({
    //padding: '0',
    //marginBottom: '0',
    ...isDragging ? {
      background: 'white'
    } : {},
    ...draggableStyle
  }),
  getDraggableListStyle: isDraggingOver => ({
    //padding: '4px 0 1px',
    //marginBottom: 'O',
    ... isDraggingOver ? {
      background: '#f9f9f9'
    } : {}
  })
}
