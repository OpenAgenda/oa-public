<?php

 // I'm skipping a lloooot of verification steps on the file here.
 // Also, I'm assuming you uploaded a jpg.. should give the full path
 $imagePath = 'uploaded/'. rand(1,9999) .'.jpg';
 move_uploaded_file($_FILES['image']['tmp_name'], $imagePath);

 $imagePath = 'http://js.cibul.net/cibul/handleEventImage/examples/server/' . $imagePath;

?>
<!DOCTYPE html>
<html>
  <body>
    <script type="text/javascript">
      <?php echo 'window.parent[\'' . $_GET['callback'] . '\'](' . json_encode(array('success' => true, 'path' => $imagePath)) . ')' ?>
    </script>
  </body>
</html>