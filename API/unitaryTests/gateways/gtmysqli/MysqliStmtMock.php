<?php
/**
 * @author David Campos Rodríguez <david.campos.r96@gmail.com>
 */

/**
 * Class MysqliStmtMock, we need to create our own mockup for mysqli_stmt because the mocks generated by
 * PhpUnit don't allow to mock methods which have parameters passed by reference (it makes a copy of the
 * passed arguments converting any reference into a value).
 * This class is kinda hack-up to solve this and be able to check if the methods return the values we give them.
 */
class MysqliStmtMock {
    /** @var bool */
    private $executed;
    /** @var  PhpUnit\Framework\TestCase */
    private $testCase;
    /** @var array */
    private $resultsBindings;
    /** @var bool */
    private $canExecute;
    /** @var [[mixed]] */
    private $values;
    /** @var bool */
    private $canFetch;
    /** @var int */
    private $currentFetch;

    /**
     * MysqliStmtMock constructor.
     * @param PHPUnit\Framework\TestCase $testCase
     * @param bool $canExecute
     * @param bool $canFetch
     * @param [[mixed]] $values must contain at least one element as example! (use canFetch if you want to simulate no-rows)
     */
    public function __construct($testCase, $canExecute, $canFetch, $values) {
        // No parent call
        $this->testCase = $testCase;
        $this->executed = false;
        $this->resultsBindings = null;
        $this->canFetch = $canFetch;
        $this->canExecute = $canExecute;
        $this->values = $values;
        $this->currentFetch = -1;
    }

    public function bind_param($types, &$var1, &$_ = null) {
        $this->testCase->assertFalse($this->executed, "You should have binded params before executing");
        $this->testCase->assertEquals(func_num_args()-1, strlen($types), 'No match between length of types and number of binded params');
        $this->testCase->assertTrue(preg_match("/[idsb]+/", $types)==1, "Invalid types for bind_param");
    }

    public function bind_result(&$var1, &...$_) {
        $this->testCase->assertTrue($this->executed, "You must execute before binding results!");
        $this->testCase->assertEquals(count($this->values[0]), func_num_args(), "Values and bind_results arguments doesn't match count");
        $stack = debug_backtrace(); // We need references!
        if (isset($stack[0]["args"]))
            for($i=0; $i < count($stack[0]["args"]); $i++)
                $this->resultsBindings[] = & $stack[0]["args"][$i];
    }

    public function close() {
        return true;
    }

    public function execute() {
        $this->executed = true;
        $this->currentFetch = 0;
        return $this->canExecute;
    }

    public function fetch() {
        $this->testCase->assertNotNull($this->resultsBindings, "Error! fetch before binding result.");
        if(!$this->canFetch || $this->currentFetch >= count($this->values)) return false;
        for($i=0; $i < count($this->values[$this->currentFetch]); ++$i) {
           $this->resultsBindings[$i] = $this->values[$this->currentFetch][$i];
        }
        $this->currentFetch+=1;
        return true;
    }

    public function attr_get($attr) {
        throw new \Exception('Method not implemented in mock');
    }

    public function attr_set($attr, $mode) {
        throw new \Exception('Method not implemented in mock');
    }

    public function data_seek($offset) {
        throw new \Exception('Method not implemented in mock');
    }

    public function get_warnings(mysqli_stmt $stmt) {
        throw new \Exception('Method not implemented in mock');
    }

    public function result_metadata() {
        throw new \Exception('Method not implemented in mock');
    }

    public function more_results() {
        throw new \Exception('Method not implemented in mock');
    }

    public function next_result() {
        throw new \Exception('Method not implemented in mock');
    }

    public function num_rows(mysqli_stmt $stmt) {
        throw new \Exception('Method not implemented in mock');
    }

    public function send_long_data($param_nr, $data) {
        throw new \Exception('Method not implemented in mock');
    }

    public function stmt() {
        throw new \Exception('Method not implemented in mock');
    }

    public function free_result() {
        throw new \Exception('Method not implemented in mock');
    }

    public function reset() {
        throw new \Exception('Method not implemented in mock');
    }

    public function prepare($query) {
        throw new \Exception('Method not implemented in mock');
    }

    public function store_result() {
        throw new \Exception('Method not implemented in mock');
    }

    public function get_result() {
        throw new \Exception('Method not implemented in mock');
    }


}