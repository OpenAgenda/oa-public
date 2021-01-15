<?php

 // I'm skipping a lloooot of verification steps on the file here.
 // Also, I'm assuming you uploaded a jpg.. should give the full path
 $name = rand(1,9999) .'.jpg';
 move_uploaded_file($_FILES['image']['tmp_name'], 'uploaded/'. $name);

?>
<!DOCTYPE html>
<html>
  <body>
    <script type="text/javascript">
      <?php echo 'window.parent[\'' . $_GET['callback'] . '\'](' . json_encode(array('success' => true, 'name' => $name)) . ')' ?>
    </script>
  </body>
</html>