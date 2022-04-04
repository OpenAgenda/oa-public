export default {
  getDraggableListItemStyle: (isDragging, draggableStyle) => ({
    ...isDragging ? {
      background: 'white'
    } : {},
    ...draggableStyle
  }),
  getDraggableListStyle: isDraggingOver => ({
    ...isDraggingOver ? {
      background: '#f9f9f9'
    } : {}
  })
};
