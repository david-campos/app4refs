<?php
/**
 * Short script to check all the item icons which the application has.
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

?>
<!DOCTYPE html>
<html>
<head><title>Check item icons</title></head>
<style>
    body {
        font-family: Verdana, sans-serif;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    thead {
        font-weight: bold;
    }
    td {
        border: 1px solid gray;
    }
</style>
<body>
<h3>Not found</h3>
<?php
// Database connection
$mysqli = new mysqli('localhost', 'root', '', 'app4refs');
if ($mysqli->connect_error) {
    die('<b>Database connection error (' . $mysqli->connect_errno . ') '
        . $mysqli->connect_error."</b>");
}
$mysqli->autocommit(false);
if (!$mysqli->set_charset("utf8")) {
    die("<b>Error loading charset utf8:".$mysqli->error."</b>");
}

// Get all the items from the database
$stmt = $mysqli->prepare('SELECT item_id, `name` FROM items');
if($stmt === false) {
    die("<b>Error in query: ".$mysqli->error."</b>");
}
$stmt->execute();
$stmt->bind_result($id, $name);
$found = [];
$notFound = [];
$allNames = [];
while($stmt->fetch()) {
    $processedName = strtolower(preg_replace('/\(|\)|\s|\?|-|"|\./', "", $name));
    $file_dir = dirname(__FILE__).'/ico/items/'.$processedName.'.jpg';
    if(!file_exists($file_dir)) {
        $notFound[] = ['id'=>$id, 'name'=>$name, 'file'=>$processedName.'.jpg'];
    } else {
        $found[] = ['id'=>$id, 'name'=>$name, 'file'=>$processedName.'.jpg'];
    }
    $allNames[] = $name;
}
$stmt->close();
$files = scandir(dirname(__FILE__).'/ico/items/');
$unusedFiles = $files;
?>
<table style='color:red'>
    <thead><tr><td>Id</td><td>Name</td><td>Expected file</td><td>4 closest names</td><td>4 closest files</td></tr></thead>
    <tbody>
<?php
foreach($notFound as $item) {
    // Print the data
    echo "<tr><td>".$item['id']."</td><td>".$item['name']."</td><td>".$item['file']."</td>";

    // Print 4 more close
    $orderedNames = $allNames;
    usort($orderedNames, function($a, $b) use ($item) {
        $aDist = levenshtein($a, $item['name']);
        $bDist = levenshtein($b, $item['name']);
        if($aDist === $bDist) return 0;
        return ($aDist < $bDist)?-1:1;
    });
    // First one is itself
    $orderedNames = array_slice($orderedNames, 1, 4);
    $orderedFiles = $files;
    usort($orderedFiles, function($a, $b) use ($item) {
        $aDist = levenshtein($a, $item['file']);
        $bDist = levenshtein($b, $item['file']);
        if($aDist === $bDist) return 0;
        return ($aDist < $bDist)?-1:1;
    });
    $orderedFiles = array_slice($orderedFiles, 0, 4);
    $orderedFiles = array_map(function($val) use ($found) {
        $used = false;
        foreach($found as $itemFound) {
            if($itemFound['file'] === $val) {
                $used = true;
                break;
            }
        }
        $color = ($used?'red':'green');
        return "<span style='color: $color;'>$val</span>";
    }, $orderedFiles);
    echo "<td>".implode('<br>', $orderedNames)."</td>";
    echo "<td>".implode('<br>', $orderedFiles)."</td>";
    echo "</tr>";
}
?>
    </tbody>
</table>
<h3>Found</h3>
<table style='color:green'>
    <thead><tr><td>Id</td><td>Name</td><td>Expected file</td></tr></thead>
    <tbody>
<?php
foreach($found as $item) {
    $idx = array_search($item['file'], $unusedFiles);
    echo "<tr><td>".$item['id']."</td><td>".$item['name']."</td><td>".$item['file']."</td></tr>";
    if($idx !== false) {
        array_splice($unusedFiles, $idx, 1);
    }
}
?>
    </tbody>
</table>
<h3>Unused files</h3>
<table>
    <thead><tr><td>File</td></tr></thead>
<?php
foreach($unusedFiles as $file) {
    echo "<tr><td>$file</td></tr>";
}
?>
</table>
<h3>All files</h3>
<table>
    <thead><tr><td>File</td></tr></thead>
    <?php
    foreach($files as $file) {
        echo "<tr><td>$file</td></tr>";
    }
    ?>
</table>
</body>
</html>